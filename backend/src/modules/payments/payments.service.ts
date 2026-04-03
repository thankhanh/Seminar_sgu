import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto, PaymentMethodEnum, SubscriptionTypeEnum } from './dto/create-payment.dto';
import { TransactionType, MerchantPlan } from '@prisma/client';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import * as crypto from 'crypto';
import * as https from 'https';
import * as querystring from 'querystring';

// Mapping DTO type to Prisma Enum
const TYPE_TO_PLAN: Record<string, MerchantPlan> = {
  [SubscriptionTypeEnum.MERCHANT_STARTER]: MerchantPlan.starter,
  [SubscriptionTypeEnum.MERCHANT_BUSINESS]: MerchantPlan.business,
  [SubscriptionTypeEnum.MERCHANT_PREMIUM]: MerchantPlan.premium,
};


@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(forwardRef(() => MerchantSubscriptionsService))
    private subscriptionService: MerchantSubscriptionsService,
    @Inject(forwardRef(() => SubscriptionsService))
    private userSubscriptionService: SubscriptionsService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // VNPAY
  // ─────────────────────────────────────────────────────────────

  async createVnpayPayment(userId: string, dto: CreatePaymentDto, ipAddr: string) {
    let amount = dto.amount || 0;
    let label = dto.orderInfo || 'Thanh toán đơn hàng';

    if (!dto.amount && dto.type) {
      const metadata = await this.prisma.planMetadata.findUnique({
        where: { planKey: dto.type },
      });
      if (!metadata) throw new BadRequestException('Gói dịch vụ không hợp lệ');
      amount = Number(metadata.price);
      label = `Thanh toán gói ${metadata.name}`;
    }

    if (!amount) throw new BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');

    // Tạo transaction trong DB
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'VND',
        type: dto.type.startsWith('user') ? 'user_subscription' : 'merchant_subscription',
        paymentMethod: 'vnpay',
        status: 'pending',
        description: label + (dto.type ? ` [KEY=${dto.type}]` : ''),
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

    if (success) {
      await this.handlePostPayment(vnpDetail.transactionId);
    }

    return { success, responseCode, transactionId: vnpDetail.transactionId };
  }

  /**
   * Xử lý các tác vụ sau khi thanh toán thành công (Kích hoạt gói...)
   */
  private async handlePostPayment(transactionId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!tx || tx.status !== 'success') return;

    if (tx.type === 'merchant_subscription') {
      const merchant = await this.prisma.merchant.findUnique({ where: { userId: tx.userId } });
      if (merchant) {
        // Ưu tiên dùng planKey nếu có
        let plan: MerchantPlan | null = null;
        
        let planKey = null;
        const match = tx.description?.match(/\[KEY=(.+?)\]/);
        if (match) planKey = match[1];

        if (planKey && TYPE_TO_PLAN[planKey]) {
          plan = TYPE_TO_PLAN[planKey];
        } else {
          // Fallback theo amount nếu không có planKey
          const amount = Number(tx.amount);
          if (amount >= 900000) plan = MerchantPlan.premium;
          else if (amount >= 400000) plan = MerchantPlan.business;
        }
        
        if (plan) {
          await this.subscriptionService.activatePlan(merchant.id, plan);
        }
      }
    } else if (tx.type === 'user_subscription') {
      let planKey = null;
      const match = tx.description?.match(/\[KEY=(.+?)\]/);
      if (match) planKey = match[1];
      
      const email = (tx as any).user?.email;
      if (planKey && email) {
        const plan = planKey.replace('user_', '') as any; // monthly, yearly
        await this.userSubscriptionService.create({
            email,
            plan
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────

  async createMomoPayment(userId: string, dto: CreatePaymentDto) {
    let amount = dto.amount || 0;
    let label = dto.orderInfo || 'Thanh toán đơn hàng';

    if (!dto.amount && dto.type) {
      const metadata = await this.prisma.planMetadata.findUnique({
        where: { planKey: dto.type },
      });
      if (!metadata) throw new BadRequestException('Gói dịch vụ không hợp lệ');
      amount = Number(metadata.price);
      label = `Thanh toán gói ${metadata.name}`;
    }

    if (!amount) throw new BadRequestException('Bắt buộc phải có amount hoặc type hợp lệ');

    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'VND',
        type: (dto.amount ? 'food_order' : (dto.type?.startsWith('user') ? 'user_subscription' : 'merchant_subscription')) as TransactionType,
        paymentMethod: 'momo',
        status: 'pending',
        description: label + (dto.type ? ` [KEY=${dto.type}]` : ''),
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
    const requestType = 'captureWallet';
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

    if (success) {
      await this.handlePostPayment(momoDetail.transactionId);
    }

    return { message: 'IPN processed' };
  }

  async getTransactionStatus(transactionId: string, userId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: { id: true, status: true, amount: true, type: true, createdAt: true },
    });
    if (!tx) throw new BadRequestException('Không tìm thấy giao dịch');
    return tx;
  }

  async getTransactionHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { momoDetail: true },
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
