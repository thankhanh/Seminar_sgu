import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createForUserId(userId: string, plan: SubscriptionPlan) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.create({ email: user.email, plan });
  }

  async create(dto: CreateUserSubscriptionDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này');
    }

    const userId = user.id;

    // Kiểm tra xem có gói Monthly đang hoạt động không để xử lý "nối tiếp" (queueing)
    const activeMonthly = await this.prisma.subscription.findFirst({
      where: {
        userId: userId,
        plan: SubscriptionPlan.monthly,
        status: SubscriptionStatus.active,
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: 'desc' },
    });

    let startDate = new Date();

    // Nếu mua Yearly và đang có Monthly, bắt đầu Yearly ngay sau khi Monthly kết thúc
    if (dto.plan === SubscriptionPlan.yearly && activeMonthly) {
      startDate = new Date(activeMonthly.endDate);
    } 

    const endDate = new Date(startDate);
    if (dto.plan === SubscriptionPlan.monthly) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (dto.plan === SubscriptionPlan.yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Free plan - hiệu lực 100 năm
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    return this.prisma.subscription.create({
      data: {
        userId: userId,
        plan: dto.plan,
        startDate,
        endDate,
        status: SubscriptionStatus.active,
      },
    });
  }

  async switchPlan(userId: string, plan: SubscriptionPlan) {
    // Kiểm tra xem đã có gói này đang active và chưa hết hạn chưa
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        plan,
        status: SubscriptionStatus.active,
        endDate: { gt: new Date() },
      }
    });

    if (existing) {
      // Chỉ cần cập nhật createdAt để nó trở thành gói hiện tại (most recent)
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: { createdAt: new Date() }
      });
      return { requiresPayment: false, plan };
    }

    // Nếu là gói Free, kích hoạt ngay (100 năm)
    if (plan === SubscriptionPlan.free) {
      await this.createForUserId(userId, plan);
      return { requiresPayment: false, plan };
    }

    // Các gói khác yêu cầu thanh toán
    return { requiresPayment: true, plan };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: {
          plan: { not: SubscriptionPlan.free },
          status: SubscriptionStatus.active,
        },
        distinct: ['userId'],
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.groupBy({
        by: ['userId'],
        where: {
          plan: { not: SubscriptionPlan.free },
          status: SubscriptionStatus.active,
        },
      }).then(groups => groups.length),
    ]);

    return { data, total, page, limit };
  }

  async getMySubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.active,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.cancelled },
    });
  }

  async updatePlan(id: string, plan: SubscriptionPlan) {
    const existing = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy gói đăng ký này');
    }

    // Tính lại ngày hết hạn dựa trên gói mới
    const startDate = existing.startDate;
    const endDate = new Date(startDate);
    if (plan === SubscriptionPlan.monthly) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === SubscriptionPlan.yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Free plan - hiệu lực 100 năm
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        plan,
        endDate,
        status: SubscriptionStatus.active,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }
}
