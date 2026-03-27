import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generateQr(storeId: string, userId: string) {
    // Kiểm tra store thuộc về merchant của user
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    if (store.merchant.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền tạo QR cho store này');

    const code = uuidv4();
    const qr = await this.prisma.qrCode.create({
      data: {
        storeId,
        code,
        qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`,
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
    return { store: qr.store };
  }

  async getStoreQrCodes(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    if (store.merchant.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xem QR của store này');

    return this.prisma.qrCode.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
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

    // Tìm narration mặc định (tiếng Việt)
    const defaultNarration = qr.store.narrations.find(n => n.language.code === 'vi' && n.isActive);
    if (defaultNarration) {
      // Ghi nhận listen
      await this.prisma.listenHistory.create({
        data: {
          userId,
          storeId: qr.store.id,
          narrationId: defaultNarration.id,
          source: 'qr',
        },
      });
    }

    return { store: qr.store, listened: !!defaultNarration };
  }
}
