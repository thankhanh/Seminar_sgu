import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';
import { MerchantPlan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private merchantSubscriptionsService: MerchantSubscriptionsService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: dto.role,
        isActive: dto.role === 'merchant' ? false : true,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (dto.role === 'merchant') {
      await this.prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: `${user.name}'s Business`,
          status: 'pending',
        },
      });
    }

    return user;
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, isActive: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }

  async getAllMerchants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.merchant.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          _count: {
            select: { stores: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count(),
    ]);
    return { data, total, page, limit };
  }

  async approveMerchant(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) return null;
    
    await this.prisma.user.update({
      where: { id: merchant.userId },
      data: { isActive: true }
    });

    const updatedMerchant = await this.prisma.merchant.update({
      where: { id },
      data: { status: 'approved' },
    });

    // Tự động kích hoạt gói Starter khi được duyệt
    await this.merchantSubscriptionsService.activatePlan(merchant.id, MerchantPlan.starter);

    return updatedMerchant;
  }

  async rejectMerchant(id: string, reason?: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { status: 'rejected', rejectReason: reason },
    });
  }

  async toggleUserActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user?.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }

  async getStats() {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      userCount,
      merchantCount,
      merchantCountPending,
      storeCount,
      storeCountActive,
      transactionCount,
      totalRevenue,
      lastMonthUserCount,
      lastMonthStoreCount,
      lastMonthTransactionCount,
      lastMonthRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'user' } }),
      this.prisma.merchant.count(),
      this.prisma.merchant.count({ where: { status: 'pending' } }),
      this.prisma.store.count(),
      this.prisma.store.count({ where: { status: 'active' } }),
      this.prisma.transaction.count({ where: { status: 'success' } }),
      this.prisma.transaction.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
      }),
      // Cumulative count before this month started
      this.prisma.user.count({ where: { role: 'user', createdAt: { lt: firstDayCurrentMonth } } }),
      this.prisma.store.count({ where: { createdAt: { lt: firstDayCurrentMonth } } }),
      this.prisma.transaction.count({
        where: { status: 'success', createdAt: { lt: firstDayCurrentMonth } },
      }),
      this.prisma.transaction.aggregate({
        where: { status: 'success', createdAt: { lt: firstDayCurrentMonth } },
        _sum: { amount: true },
      }),
    ]);

    // Monthly revenue for the last 12 months (chart data)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const rev = await this.prisma.transaction.aggregate({
        where: {
          status: 'success',
          createdAt: { gte: d, lt: nextD },
        },
        _sum: { amount: true },
      });
      monthlyRevenue.push(Number(rev._sum.amount || 0));
    }

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      const growth = ((current - previous) / previous) * 100;
      return Math.round(growth * 10) / 10; // 1 decimal place
    };

    // --- Top Rankings ---
    const topPOIResult = await this.prisma.listenHistory.groupBy({
      by: ['storeId'],
      where: { listenedAt: { gte: firstDayCurrentMonth } },
      _count: { storeId: true },
      orderBy: { _count: { storeId: 'desc' } },
      take: 1,
    });
    let topPOI = null;
    if (topPOIResult.length > 0) {
      const store = await this.prisma.store.findUnique({ where: { id: topPOIResult[0].storeId }, select: { name: true } });
      topPOI = { name: store?.name || 'Bí ẩn', count: topPOIResult[0]._count.storeId };
    }

    const topMerchantResult = await this.prisma.merchant.findFirst({
      orderBy: { stores: { _count: 'desc' } },
      select: { businessName: true, _count: { select: { stores: true } } },
    });
    const topMerchant = topMerchantResult
      ? { name: topMerchantResult.businessName || 'Chưa rõ', count: topMerchantResult._count.stores }
      : null;

    const topClientResult = await this.prisma.listenHistory.groupBy({
      by: ['userId'],
      where: { listenedAt: { gte: firstDayCurrentMonth } },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 1,
    });
    let topClient = null;
    if (topClientResult.length > 0) {
      const user = await this.prisma.user.findUnique({ where: { id: topClientResult[0].userId }, select: { name: true } });
      topClient = { name: user?.name || 'Khách', count: topClientResult[0]._count.userId };
    }

    return {
      userCount,
      merchantCount,
      merchantCountPending,
      storeCount,
      storeCountActive,
      transactionCount,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      userGrowth: calculateGrowth(userCount, lastMonthUserCount),
      storeGrowth: calculateGrowth(storeCount, lastMonthStoreCount),
      transactionGrowth: calculateGrowth(transactionCount, lastMonthTransactionCount),
      revenueGrowth: calculateGrowth(
        Number(totalRevenue._sum.amount || 0),
        Number(lastMonthRevenue._sum.amount || 0),
      ),
      monthlyRevenue,
      topPOI,
      topMerchant,
      topClient,
    };
  }
}
