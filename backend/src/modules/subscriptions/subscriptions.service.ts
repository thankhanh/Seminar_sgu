import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

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
    } else {
      // Các trường hợp khác: Hủy các gói cũ để thay thế ngay lập tức
      await this.prisma.subscription.updateMany({
        where: {
          userId: userId,
          status: SubscriptionStatus.active,
        },
        data: {
          status: SubscriptionStatus.cancelled,
        },
      });
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

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: {
          plan: { not: SubscriptionPlan.free }
        },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({
        where: {
          plan: { not: SubscriptionPlan.free }
        }
      }),
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
}
