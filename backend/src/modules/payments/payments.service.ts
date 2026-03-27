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
import { forwardRef, Inject } from '@nestjs/common';
import { MerchantPlan } from '@prisma/client';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';

const TYPE_TO_PLAN: Record<string, MerchantPlan> = {
  [SubscriptionTypeEnum.MERCHANT_STARTER]: MerchantPlan.starter,
  [SubscriptionTypeEnum.MERCHANT_BUSINESS]: MerchantPlan.business,
  [SubscriptionTypeEnum.MERCHANT_PREMIUM]: MerchantPlan.premium,
};

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
    @Inject(forwardRef(() => MerchantSubscriptionsService))
    private subscriptionService: MerchantSubscriptionsService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // MOMO

  /**
   * Xử lý các tác vụ sau khi thanh toán thành công (Kích hoạt gói...)
   */
  private async handlePostPayment(transactionId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx || tx.status !== 'success') return;

    if (tx.type === 'merchant_subscription') {
      // Tìm plan tương ứng từ description hoặc lưu thêm type vào transaction nếu cần
      // Ở đây ta dùng mapping từ label hoặc lưu type vào metadata.
      // Vì CreatePaymentDto có 'type', ta nên lưu nó vào Transaction hoặc Payment detail.
      // Tạm thời lấy Merchant từ userId
      const merchant = await this.prisma.merchant.findUnique({ where: { userId: tx.userId } });
      if (merchant) {
        // Xác định Plan dựa trên amount hoặc description (label)
        let plan: MerchantPlan = MerchantPlan.starter;
        const amount = Number(tx.amount);
        if (amount >= 2000000) plan = MerchantPlan.premium;
        else if (amount >= 500000) plan = MerchantPlan.business;
        
        await this.subscriptionService.activatePlan(merchant.id, plan);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────

  async createMomoPayment(userId: string, dto: CreatePaymentDto) {
    const amount = PLAN_PRICES[dto.type];
    const label = PLAN_LABELS[dto.type];

    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'VND',
        type: dto.type.startsWith('user') ? 'user_subscription' : 'merchant_subscription',
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

    if (success) {
      await this.handlePostPayment(momoDetail.transactionId);
    }

    return { message: 'IPN processed' };
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
