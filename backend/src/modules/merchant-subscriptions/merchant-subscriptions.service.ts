import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MerchantPlan, SubscriptionStatus } from '@prisma/client';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class MerchantSubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private readonly PLAN_LIMITS = {
    [MerchantPlan.starter]: 1,
    [MerchantPlan.business]: 5,
    [MerchantPlan.premium]: 10,
  };

  /**
   * Kích hoạt gói cho Merchant (Dùng cho cả gói Free và sau khi thanh toán thành công)
   */
  async activatePlan(merchantId: string, plan: MerchantPlan) {
    // Hủy các gói cũ đang active
    await this.prisma.merchantSubscription.updateMany({
      where: {
        merchantId: merchantId,
        status: SubscriptionStatus.active,
      },
      data: {
        status: SubscriptionStatus.cancelled,
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Thời hạn 1 tháng

    return this.prisma.merchantSubscription.create({
      data: {
        merchantId,
        plan,
        maxStore: this.PLAN_LIMITS[plan],
        startDate,
        endDate,
        status: SubscriptionStatus.active,
      },
    });
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Không tìm thấy thông tin Merchant');
    }

    // Nếu là gói Starter (Miễn phí), kích hoạt ngay
    if (dto.plan === MerchantPlan.starter) {
      return this.activatePlan(merchant.id, MerchantPlan.starter);
    }

    // Nếu là gói trả phí, trả về thông tin để Frontend chuyển hướng sang trang thanh toán
    // (Thực tế Frontend sẽ gọi sang module Payments riêng)
    return { 
      requiresPayment: true, 
      plan: dto.plan,
      price: dto.plan === MerchantPlan.business ? 500000 : 2000000 
    };
  }

  async getMySubscription(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) return null;

    return this.prisma.merchantSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: SubscriptionStatus.active,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.merchantSubscription.findMany({
        skip,
        take: limit,
        include: {
          merchant: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchantSubscription.count(),
    ]);

    return { data, total, page, limit };
  }

  async cancel(id: string) {
    return this.prisma.merchantSubscription.update({
      where: { id },
      data: { status: SubscriptionStatus.cancelled },
    });
  }
}
