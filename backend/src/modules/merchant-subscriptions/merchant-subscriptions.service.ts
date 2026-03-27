import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MerchantPlan, SubscriptionStatus } from '@prisma/client';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PlanMetadataService } from '../plan-metadata/plan-metadata.service';

@Injectable()
export class MerchantSubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private planMetadataService: PlanMetadataService,
  ) {}

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

    // Fetch limits from DB
    const metadata = await this.planMetadataService.findByKey(`merchant_${plan.toLowerCase()}`);
    const maxStore = metadata?.maxStore ?? 1;
    const maxPOI = metadata?.maxPOI ?? 1;

    return this.prisma.merchantSubscription.create({
      data: {
        merchantId,
        plan,
        maxStore,
        maxPOI,
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
    const metadata = await this.planMetadataService.findByKey(`merchant_${dto.plan.toLowerCase()}`);
    
    return { 
      requiresPayment: true, 
      plan: dto.plan,
      price: metadata?.price || 0 
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
        where: {
          plan: { not: MerchantPlan.starter }
        },
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
      this.prisma.merchantSubscription.count({
        where: {
          plan: { not: MerchantPlan.starter }
        }
      }),
    ]);

    return { data, total, page, limit };
  }

  async cancel(id: string) {
    return this.prisma.merchantSubscription.update({
      where: { id },
      data: { status: SubscriptionStatus.cancelled },
    });
  }

  async grant(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { merchant: true }
    });

    if (!user || !user.merchant) {
      throw new NotFoundException('Không tìm thấy Merchant với email này');
    }

    const merchantId = user.merchant.id;

    // Cancel existing active subscriptions for this merchant
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
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch limits from DB
    const metadata = await this.planMetadataService.findByKey(`merchant_${dto.plan.toLowerCase()}`);
    const maxStore = metadata?.maxStore ?? 1;
    const maxPOI = metadata?.maxPOI ?? 1;

    return this.prisma.merchantSubscription.create({
      data: {
        merchantId: merchantId,
        plan: dto.plan,
        maxStore,
        maxPOI,
        startDate,
        endDate,
        status: SubscriptionStatus.active,
      },
    });
  }
}
