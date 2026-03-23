import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
          user: { select: { id: true, name: true, email: true } },
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
}
