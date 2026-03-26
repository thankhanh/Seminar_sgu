import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto, PaymentMethodEnum, SubscriptionTypeEnum } from './dto/create-payment.dto';
import * as crypto from 'crypto';
import * as https from 'https';
import * as querystring from 'querystring';

// Giá gói đăng ký (VND)
const PLAN_PRICES: Record<SubscriptionTypeEnum, number> = {
  [SubscriptionTypeEnum.USER_MONTHLY]: 49000,
  [SubscriptionTypeEnum.USER_YEARLY]: 399000,
  [SubscriptionTypeEnum.MERCHANT_STARTER]: 199000,
  [SubscriptionTypeEnum.MERCHANT_BUSINESS]: 499000,
  [SubscriptionTypeEnum.MERCHANT_PREMIUM]: 999000,
};

const PLAN_LABELS: Record<SubscriptionTypeEnum, string> = {
  [SubscriptionTypeEnum.USER_MONTHLY]: 'Gói User Tháng',
  [SubscriptionTypeEnum.USER_YEARLY]: 'Gói User Năm',
  [SubscriptionTypeEnum.MERCHANT_STARTER]: 'Gói Merchant Starter',
  [SubscriptionTypeEnum.MERCHANT_BUSINESS]: 'Gói Merchant Business',
  [SubscriptionTypeEnum.MERCHANT_PREMIUM]: 'Gói Merchant Premium',
};

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // VNPAY
  // ─────────────────────────────────────────────────────────────

  async createVnpayPayment(userId: string, dto: CreatePaymentDto, ipAddr: string) {
    const amount = dto.amount || (dto.type ? PLAN_PRICES[dto.type] : 0);
    const label = dto.orderInfo || (dto.type ? PLAN_LABELS[dto.type] : 'Thanh toan don hang');

    if (!amount) throw new BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');

    // Tạo transaction trong DB
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'VND',
        type: dto.amount ? 'food_order' : (dto.type?.startsWith('user') ? 'user_subscription' : 'merchant_subscription'),
        paymentMethod: 'vnpay',
        status: 'pending',
        description: label,
      },
    });

    const tmnCode = this.config.get<string>('VNPAY_TMN_CODE');
    const secretKey = this.config.get<string>('VNPAY_HASH_SECRET');
    const vnpUrl = this.config.get<string>('VNPAY_URL');
    const returnUrl = this.config.get<string>('VNPAY_RETURN_URL');

    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = `${tx.id.replace(/-/g, '').substring(0, 8)}-${Date.now()}`;
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000));

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode!,
      vnp_Amount: String(amount * 100), // VNPay tính bằng đồng × 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: label,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl!,
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Lưu vnp_TxnRef vào DB
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
      .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {} as Record<string, string>);

    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
    });

    const hmac = crypto.createHmac('sha512', secretKey!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams.vnp_SecureHash = signed;

    const paymentUrl = `${vnpUrl}?${querystring.stringify(sortedParams)}`;
    return { paymentUrl, transactionId: tx.id, orderId };
  }

  async handleVnpayReturn(query: Record<string, string>) {
    const secretKey = this.config.get<string>('VNPAY_HASH_SECRET');
    const secureHash = query.vnp_SecureHash;

    const queryClone = { ...query };
    delete queryClone.vnp_SecureHash;
    delete queryClone.vnp_SecureHashType;

    const sortedParams = Object.keys(queryClone)
      .sort()
      .reduce((acc, k) => ({ ...acc, [k]: queryClone[k] }), {} as Record<string, string>);

    const signData = querystring.stringify(sortedParams, undefined, undefined, {
      encodeURIComponent: (str) => encodeURIComponent(str).replace(/%20/g, '+'),
    });
    const hmac = crypto.createHmac('sha512', secretKey!);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (signed !== secureHash) {
      throw new BadRequestException('Chữ ký VNPay không hợp lệ');
    }

    const txnRef = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const success = responseCode === '00';

    const vnpDetail = await this.prisma.paymentVnpay.findUnique({
      where: { vnpTxnRef: txnRef },
      include: { transaction: true },
    });
    if (!vnpDetail) throw new BadRequestException('Không tìm thấy giao dịch');

    // Cập nhật trạng thái
    await this.prisma.paymentVnpay.update({
      where: { vnpTxnRef: txnRef },
      data: {
        vnpResponseCode: responseCode,
        vnpTransactionNo: query.vnp_TransactionNo,
        vnpBankCode: query.vnp_BankCode,
        vnpPayDate: query.vnp_PayDate,
        vnpSecureHash: secureHash,
        rawResponse: query as any,
      },
    });

    await this.prisma.transaction.update({
      where: { id: vnpDetail.transactionId },
      data: { status: success ? 'success' : 'failed', paymentRefId: query.vnp_TransactionNo },
    });

    return { success, responseCode, transactionId: vnpDetail.transactionId };
  }

  async handleVnpayIpn(query: Record<string, string>) {
    // Giống return nhưng trả về theo đặc tả IPN của VNPay
    const result = await this.handleVnpayReturn(query);
    return { RspCode: '00', Message: 'Confirm Success' };
  }

  // ─────────────────────────────────────────────────────────────
  // MOMO
  // ─────────────────────────────────────────────────────────────

  async createMomoPayment(userId: string, dto: CreatePaymentDto) {
    const amount = dto.amount || (dto.type ? PLAN_PRICES[dto.type] : 0);
    const label = dto.orderInfo || (dto.type ? PLAN_LABELS[dto.type] : 'Thanh toan don hang');

    if (!amount) throw new BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');

    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'VND',
        type: dto.amount ? 'food_order' : (dto.type?.startsWith('user') ? 'user_subscription' : 'merchant_subscription'),
        paymentMethod: 'momo',
        status: 'pending',
        description: label,
      },
    });

    const partnerCode = this.config.get<string>('MOMO_PARTNER_CODE')!;
    const accessKey = this.config.get<string>('MOMO_ACCESS_KEY')!;
    const secretKey = this.config.get<string>('MOMO_SECRET_KEY')!;
    const endpoint = this.config.get<string>('MOMO_ENDPOINT')!;
    const ipnUrl = this.config.get<string>('MOMO_IPN_URL')!;
    const redirectUrl = this.config.get<string>('MOMO_REDIRECT_URL')!;

    const requestId = `${partnerCode}-${Date.now()}`;
    const orderId = `VK-${tx.id.replace(/-/g, '').substring(0, 8)}-${Date.now()}`;
    const requestType = 'payWithMethod';
    const orderInfo = label;
    const extraData = '';
    const autoCapture = true;
    const lang = 'vi';

    // Tạo raw signature theo đặc tả MoMo v2
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

    // Lưu vào DB
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

    // Gọi MoMo API
    const momoResponse = await this.postRequest(endpoint, body);

    if (momoResponse.resultCode !== 0) {
      throw new BadRequestException(`MoMo lỗi: ${momoResponse.message}`);
    }

    return {
      paymentUrl: momoResponse.payUrl,
      deeplink: momoResponse.deeplink,
      qrCodeUrl: momoResponse.qrCodeUrl,
      transactionId: tx.id,
      orderId,
    };
  }

  async handleMomoIpn(body: Record<string, any>) {
    const secretKey = this.config.get<string>('MOMO_SECRET_KEY')!;
    const accessKey = this.config.get<string>('MOMO_ACCESS_KEY')!;

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
      throw new BadRequestException('Chữ ký MoMo IPN không hợp lệ');
    }

    const success = body.resultCode === 0;
    const momoDetail = await this.prisma.paymentMomo.findUnique({
      where: { orderId: body.orderId },
    });
    if (!momoDetail) throw new BadRequestException('Không tìm thấy đơn hàng');

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

  async getTransactionHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { vnpayDetail: true, momoDetail: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    );
  }

  private postRequest(url: string, body: string): Promise<any> {
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
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid JSON from MoMo')); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
