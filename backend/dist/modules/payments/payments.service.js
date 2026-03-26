"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");
const PLAN_PRICES = {
    [create_payment_dto_1.SubscriptionTypeEnum.USER_MONTHLY]: 49000,
    [create_payment_dto_1.SubscriptionTypeEnum.USER_YEARLY]: 399000,
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_STARTER]: 199000,
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_BUSINESS]: 499000,
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_PREMIUM]: 999000,
};
const PLAN_LABELS = {
    [create_payment_dto_1.SubscriptionTypeEnum.USER_MONTHLY]: 'Gói User Tháng',
    [create_payment_dto_1.SubscriptionTypeEnum.USER_YEARLY]: 'Gói User Năm',
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_STARTER]: 'Gói Merchant Starter',
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_BUSINESS]: 'Gói Merchant Business',
    [create_payment_dto_1.SubscriptionTypeEnum.MERCHANT_PREMIUM]: 'Gói Merchant Premium',
};
let PaymentsService = class PaymentsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async createVnpayPayment(userId, dto, ipAddr) {
        const amount = dto.amount || (dto.type ? PLAN_PRICES[dto.type] : 0);
        const label = dto.orderInfo || (dto.type ? PLAN_LABELS[dto.type] : 'Thanh toan don hang');
        if (!amount)
            throw new common_1.BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');
        const tx = await this.prisma.transaction.create({
            data: {
                userId,
                amount,
                currency: 'VND',
                type: (dto.amount ? 'food_order' : (dto.type?.startsWith('user') ? 'user_subscription' : 'merchant_subscription')),
                paymentMethod: 'vnpay',
                status: 'pending',
                description: label,
            },
        });
        const tmnCode = this.config.get('VNPAY_TMN_CODE');
        const secretKey = this.config.get('VNPAY_HASH_SECRET');
        const vnpUrl = this.config.get('VNPAY_URL');
        const returnUrl = this.config.get('VNPAY_RETURN_URL');
        const date = new Date();
        const createDate = this.formatDate(date);
        const orderId = `${tx.id.replace(/-/g, '').substring(0, 8)}-${Date.now()}`;
        const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000));
        const params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: String(amount * 100),
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: label,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr || '127.0.0.1',
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };
        await this.prisma.paymentVnpay.create({
            data: {
                transactionId: tx.id,
                vnpTxnRef: orderId,
                vnpAmount: BigInt(amount * 100),
                vnpOrderInfo: label,
            },
        });
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
        const signData = querystring.stringify(sortedParams, undefined, undefined, {
            encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
        });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        sortedParams.vnp_SecureHash = signed;
        const paymentUrl = `${vnpUrl}?${querystring.stringify(sortedParams)}`;
        return { paymentUrl, transactionId: tx.id, orderId };
    }
    async handleVnpayReturn(query) {
        const secretKey = this.config.get('VNPAY_HASH_SECRET');
        const secureHash = query.vnp_SecureHash;
        const queryClone = { ...query };
        delete queryClone.vnp_SecureHash;
        delete queryClone.vnp_SecureHashType;
        const sortedParams = Object.keys(queryClone)
            .sort()
            .reduce((acc, k) => ({ ...acc, [k]: queryClone[k] }), {});
        const signData = querystring.stringify(sortedParams, undefined, undefined, {
            encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
        });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        if (signed !== secureHash) {
            throw new common_1.BadRequestException('Chữ ký VNPay không hợp lệ');
        }
        const txnRef = query.vnp_TxnRef;
        const responseCode = query.vnp_ResponseCode;
        const success = responseCode === '00';
        const vnpDetail = await this.prisma.paymentVnpay.findUnique({
            where: { vnpTxnRef: txnRef },
            include: { transaction: true },
        });
        if (!vnpDetail)
            throw new common_1.BadRequestException('Không tìm thấy giao dịch');
        await this.prisma.paymentVnpay.update({
            where: { vnpTxnRef: txnRef },
            data: {
                vnpResponseCode: responseCode,
                vnpTransactionNo: query.vnp_TransactionNo,
                vnpBankCode: query.vnp_BankCode,
                vnpPayDate: query.vnp_PayDate,
                vnpSecureHash: secureHash,
                rawResponse: query,
            },
        });
        await this.prisma.transaction.update({
            where: { id: vnpDetail.transactionId },
            data: { status: success ? 'success' : 'failed', paymentRefId: query.vnp_TransactionNo },
        });
        return { success, responseCode, transactionId: vnpDetail.transactionId };
    }
    async handleVnpayIpn(query) {
        const result = await this.handleVnpayReturn(query);
        return { RspCode: '00', Message: 'Confirm Success' };
    }
    async createMomoPayment(userId, dto) {
        const amount = dto.amount || (dto.type ? PLAN_PRICES[dto.type] : 0);
        const label = dto.orderInfo || (dto.type ? PLAN_LABELS[dto.type] : 'Thanh toan don hang');
        if (!amount)
            throw new common_1.BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');
        const tx = await this.prisma.transaction.create({
            data: {
                userId,
                amount,
                currency: 'VND',
                type: (dto.amount ? 'food_order' : (dto.type?.startsWith('user') ? 'user_subscription' : 'merchant_subscription')),
                paymentMethod: 'momo',
                status: 'pending',
                description: label,
            },
        });
        const partnerCode = this.config.get('MOMO_PARTNER_CODE');
        const accessKey = this.config.get('MOMO_ACCESS_KEY');
        const secretKey = this.config.get('MOMO_SECRET_KEY');
        const endpoint = this.config.get('MOMO_ENDPOINT');
        const ipnUrl = this.config.get('MOMO_IPN_URL');
        const redirectUrl = this.config.get('MOMO_REDIRECT_URL');
        const requestId = `${partnerCode}-${Date.now()}`;
        const orderId = `VK-${tx.id.replace(/-/g, '').substring(0, 8)}-${Date.now()}`;
        const requestType = 'payWithMethod';
        const orderInfo = label;
        const extraData = '';
        const autoCapture = true;
        const lang = 'vi';
        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${ipnUrl}`,
            `orderId=${orderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${partnerCode}`,
            `redirectUrl=${redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join('&');
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        const body = JSON.stringify({
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang,
        });
        await this.prisma.paymentMomo.create({
            data: {
                transactionId: tx.id,
                orderId,
                requestId,
                amount: BigInt(amount),
                orderInfo: label,
                signature,
            },
        });
        const momoResponse = await this.postRequest(endpoint, body);
        if (momoResponse.resultCode !== 0) {
            throw new common_1.BadRequestException(`MoMo lỗi: ${momoResponse.message}`);
        }
        return {
            paymentUrl: momoResponse.payUrl,
            deeplink: momoResponse.deeplink,
            qrCodeUrl: momoResponse.qrCodeUrl,
            transactionId: tx.id,
            orderId,
        };
    }
    async handleMomoIpn(body) {
        const secretKey = this.config.get('MOMO_SECRET_KEY');
        const accessKey = this.config.get('MOMO_ACCESS_KEY');
        const { signature, ...rest } = body;
        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${rest.amount}`,
            `extraData=${rest.extraData || ''}`,
            `message=${rest.message}`,
            `orderId=${rest.orderId}`,
            `orderInfo=${rest.orderInfo}`,
            `orderType=${rest.orderType}`,
            `partnerCode=${rest.partnerCode}`,
            `payType=${rest.payType}`,
            `requestId=${rest.requestId}`,
            `responseTime=${rest.responseTime}`,
            `resultCode=${rest.resultCode}`,
            `transId=${rest.transId}`,
        ].join('&');
        const expectedSig = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        if (expectedSig !== signature) {
            throw new common_1.BadRequestException('Chữ ký MoMo IPN không hợp lệ');
        }
        const success = body.resultCode === 0;
        const momoDetail = await this.prisma.paymentMomo.findUnique({
            where: { orderId: body.orderId },
        });
        if (!momoDetail)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.prisma.paymentMomo.update({
            where: { orderId: body.orderId },
            data: {
                momoTransId: String(body.transId),
                resultCode: body.resultCode,
                message: body.message,
                payType: body.payType,
                rawResponse: body,
            },
        });
        await this.prisma.transaction.update({
            where: { id: momoDetail.transactionId },
            data: {
                status: success ? 'success' : 'failed',
                paymentRefId: String(body.transId),
            },
        });
        return { message: 'IPN processed' };
    }
    async getTransactionHistory(userId) {
        return this.prisma.transaction.findMany({
            where: { userId },
            include: { vnpayDetail: true, momoDetail: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    formatDate(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        return (`${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`);
    }
    postRequest(url, body) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        reject(new Error('Invalid JSON from MoMo'));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map