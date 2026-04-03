import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  /** Kiểm tra quyền sở hữu store (admin bypass) */
  private async verifyStoreAccess(storeId: string, user: { id: string; role: string }) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    // Admin có quyền truy cập mọi store
    if (user.role !== 'admin' && store.merchant.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền thao tác QR cho store này');
    }
    return store;
  }

  async generateQr(storeId: string, user: { id: string; role: string }) {
    await this.verifyStoreAccess(storeId, user);

    // Vô hiệu hóa tất cả QR cũ của store này trước khi tạo mới
    await this.prisma.qrCode.updateMany({
      where: { storeId, isActive: true },
      data: { isActive: false },
    });

    const code = uuidv4();
    const deepLink = `smarttour://stall/${storeId}?autoplay=1`;
    const qr = await this.prisma.qrCode.create({
      data: {
        storeId,
        code,
        qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}`,
        isActive: true,
      },
    });
    return qr;
  }

  async resolveQr(code: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { code },
      include: {
        store: {
          include: {
            merchant: { select: { businessName: true } },
            narrations: { include: { language: true } },
            menus: true,
          },
        },
      },
    });
    if (!qr || !qr.isActive) throw new NotFoundException('QR code không hợp lệ hoặc đã hết hạn');
    return { storeId: qr.store.id, store: qr.store };
  }

  async getStoreQrCodes(storeId: string, user: { id: string; role: string }) {
    await this.verifyStoreAccess(storeId, user);
    // Chỉ trả về QR đang active (QR cũ đã bị deactivate khi tạo mới)
    return this.prisma.qrCode.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async scanQr(code: string, userId: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { code },
      include: {
        store: {
          include: {
            merchant: { select: { businessName: true } },
            narrations: { include: { language: true } },
            menus: true,
          },
        },
      },
    });
    if (!qr || !qr.isActive) throw new NotFoundException('QR code không hợp lệ hoặc đã hết hạn');

    // Lấy ngôn ngữ ưa thích của user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });
    const preferredLang = user?.preferredLanguage || 'vi';

    // Tìm narration theo ngôn ngữ ưa thích, fallback về 'vi'
    let defaultNarration = qr.store.narrations.find(n => n.language.code === preferredLang && n.isActive);
    if (!defaultNarration) {
      defaultNarration = qr.store.narrations.find(n => n.language.code === 'vi' && n.isActive);
    }

    if (defaultNarration) {
      // Ghi nhận listen history
      await this.prisma.listenHistory.create({
        data: {
          userId,
          storeId: qr.store.id,
          narrationId: defaultNarration.id,
          source: 'qr',
        },
      });
    }

    return {
      storeId: qr.store.id,
      store: qr.store,
      narrationId: defaultNarration?.id || null,
      preferredLanguage: preferredLang,
      listened: !!defaultNarration,
    };
  }
}
