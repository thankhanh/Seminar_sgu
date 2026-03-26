import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (dto.role === 'merchant') {
      await this.prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: `${user.name}'s Business`,
          status: 'approved',
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
          user: { select: { id: true, name: true, email: true, phone: true } },
          stores: { select: { id: true, name: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count(),
    ]);
    return { data, total, page, limit };
  }

  async approveMerchant(id: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { status: 'approved' },
    });
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
    const [userCount, merchantCount, storeCount, transactionCount, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.merchant.count(),
      this.prisma.store.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
      }),
    ]);

    return {
      userCount,
      merchantCount,
      storeCount,
      transactionCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
