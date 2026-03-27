import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';
import { MerchantPlan } from '@prisma/client';

@Injectable()
export class MerchantService {
  constructor(
    private prisma: PrismaService,
    private merchantSubscriptionsService: MerchantSubscriptionsService,
  ) {}

  async register(userId: string, dto: RegisterMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Bạn đã đăng ký làm merchant rồi');

    const merchant = await this.prisma.merchant.create({
      data: {
        userId,
        businessName: dto.businessName,
        taxCode: dto.taxCode,
      },
    });

    // Cập nhật role user thành merchant và tạm khóa để chờ duyệt
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'merchant', isActive: false },
    });

    return merchant;
  }

  async getMyMerchant(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        stores: true,
        merchantSubscriptions: {
          where: { status: 'active' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!merchant) throw new NotFoundException('Bạn chưa đăng ký làm merchant');
    return merchant;
  }

  // Dùng cho Admin
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.merchant.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count(),
    ]);
    return { data, total, page, limit };
  }

  async approveMerchant(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) throw new NotFoundException('Merchant không tồn tại');
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
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) throw new NotFoundException('Merchant không tồn tại');
    return this.prisma.merchant.update({
      where: { id },
      data: { status: 'rejected', rejectReason: reason },
    });
  }
}
