import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const limitStatus = await this.getNarrationLimitStatus(userId);

    return {
      ...user,
      ...limitStatus,
    };
  }

  async countOnlineUsers() {
    return this.prisma.user.count({
      where: { isOnline: true },
    });
  }

  async getNarrationLimitStatus(userId: string) {
    // 1. Lấy gói hội viên đang kích hoạt
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Xác định giới hạn dựa trên plan (Giống logic trong NarrationsService)
    let limit = 10; // Mặc định Free là 10
    if (subscription) {
      if (subscription.plan === 'yearly') limit = 999999; // Vô hạn giả định số lớn
      else if (subscription.plan === 'monthly') limit = 30;
    }

    // 3. Đếm số lượt đã nghe trong ngày hôm nay
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const count = await this.prisma.listenHistory.count({
      where: {
        userId,
        listenedAt: { gte: todayStart },
      },
    });

    return {
      dailyListenCount: count,
      dailyListenLimit: limit,
      isLimitReached: count >= limit,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.preferredLanguage && { preferredLanguage: dto.preferredLanguage }),
      ...(dto.email && { email: dto.email }),
      ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
    };

    if (dto.password) {
      const bcrypt = require('bcryptjs');
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async getListenHistory(userId: string) {
    return this.prisma.listenHistory.findMany({
      where: { userId },
      orderBy: { listenedAt: 'desc' },
      include: {
        store: {
          select: { id: true, name: true, address: true, coverImage: true, lat: true, lng: true },
        },
        narration: {
          include: { language: true },
        },
      },
    });
  }
}
