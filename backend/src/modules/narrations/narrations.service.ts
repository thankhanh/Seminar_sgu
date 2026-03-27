import { Injectable, NotFoundException, ForbiddenException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import { translate as googleTranslate } from '@vitalets/google-translate-api';

@Injectable()
export class NarrationsService {
  constructor(private prisma: PrismaService) {}

  private async verifyStoreOwner(storeId: string, user: { id: string; role: string }) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');

    // Admin có quyền quản lý mọi store. Merchant chỉ quản lý store của mình.
    if (user.role !== 'admin' && store.merchant.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền quản lý store này');
    }

    return store;
  }

  async create(storeId: string, user: { id: string; role: string }, dto: CreateNarrationDto) {
    await this.verifyStoreOwner(storeId, user);

    const existing = await this.prisma.narration.findUnique({
      where: { storeId_languageId: { storeId, languageId: dto.languageId } },
    });
    if (existing) throw new ConflictException('Narration cho ngôn ngữ này đã tồn tại');

    return this.prisma.narration.create({
      data: {
        storeId,
        languageId: dto.languageId,
        audioUrl: dto.audioUrl,
        textContent: dto.textContent,
        duration: dto.duration,
        isActive: dto.isActive ?? true,
      },
      include: { language: true },
    });
  }

  async findByStore(storeId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store không tồn tại');
    return this.prisma.narration.findMany({
      where: { storeId, isActive: true },
      include: { language: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Haversine formula to calculate distance in meters
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

  /**
   * Dịch thuật nội dung sử dụng Google Translate API (miễn phí)
   */
  private async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Sử dụng Google Translate (miễn phí, nhanh, không cần API Key phức tạp)
    try {
      const result = await googleTranslate(text, { from: sourceLang, to: targetLang });
      const translatedText = result.text?.trim();
      
      if (translatedText) {
        console.log(`[Google Translate] Dịch ${sourceLang} -> ${targetLang}: "${translatedText.substring(0, 50)}..."`);

        // Ghi log dịch thuật để theo dõi
        try {
          const logFilePath = path.join(process.cwd(), 'translations.log');
          const logMessage = `\n----------------------------------------\n` +
                             `[${new Date().toISOString()}]\n` +
                             `[Nguồn - ${sourceLang.toUpperCase()}]: ${text}\n` +
                             `[Dịch - ${targetLang.toUpperCase()}]: ${translatedText}\n` +
                             `----------------------------------------\n`;
          fs.appendFileSync(logFilePath, logMessage, 'utf-8');
        } catch (_) {}

        return translatedText;
      }
    } catch (err: any) {
      console.error(`[Google Translate] Lỗi khi dịch: ${err.message}`);
    }

    return text; // Nếu lỗi hoàn toàn thì trả về text gốc
  }

  /**
   * Tìm thuyết minh gần vị trí hiện tại của app (Có tích hợp Tự động dịch thuật và Caching)
   */
  async findNearby(lat: number, lng: number, targetLangCode: string) {
    // 1. Tìm cửa hàng gần nhất (bán kính 50m)
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
    });

    const radius = 50; // Giới hạn 50m theo yêu cầu mới
    let nearbyStore = null;
    let minDistance = radius + 1;

    for (const store of stores) {
      const distance = this.calculateDistance(lat, lng, store.lat, store.lng);
      if (distance <= radius && distance < minDistance) {
        minDistance = distance;
        nearbyStore = store;
      }
    }

    if (!nearbyStore) {
      return { found: false, message: 'Không tìm thấy địa điểm thuyết minh nào trong phạm vi 50m' };
    }

    // 2. Tìm ngôn ngữ đích trong DB
    const targetLanguage = await this.prisma.language.findUnique({
      where: { code: targetLangCode }
    });
    if (!targetLanguage) {
      return { found: false, message: `Hệ thống chưa hỗ trợ ngôn ngữ ${targetLangCode}` };
    }

    // 3. Kiểm tra xem đã CÓ BẢN DỊCH sẵn trong DB chưa (Để tránh dịch lại tốn tiền API)
    let narration = await this.prisma.narration.findUnique({
      where: { 
        storeId_languageId: { 
          storeId: nearbyStore.id, 
          languageId: targetLanguage.id 
        } 
      }
    });

    // 4. Nếu CHƯA CÓ bản dịch, thực hiện tự động dịch từ bản VI gốc
    if (!narration) {
      // 4.1. Lấy bản gốc (VI)
      const viLanguage = await this.prisma.language.findUnique({ where: { code: 'vi' } });
      const originalNarration = await this.prisma.narration.findUnique({
        where: { 
          storeId_languageId: { 
            storeId: nearbyStore.id, 
            languageId: viLanguage.id 
          } 
        }
      });

      if (!originalNarration) {
        return { found: false, message: 'Địa điểm này chưa có nội dung thuyết minh gốc (Tiếng Việt)' };
      }

      // 4.2. Gọi hàm dịch thuật
      const translatedText = await this.translateText(originalNarration.textContent, 'vi', targetLangCode);

      // 4.3. LƯU BẢN DỊCH VÀO DB (Caching) để các user sau dùng luôn
      narration = await this.prisma.narration.create({
        data: {
          storeId: nearbyStore.id,
          languageId: targetLanguage.id,
          textContent: translatedText,
          isActive: true
        }
      });
      console.log(`[Cache] Đã lưu bản dịch mới cho store ${nearbyStore.name} (${targetLangCode})`);
    }

    return {
      found: true,
      storeName: nearbyStore.name,
      textContent: narration.textContent,
      language: targetLangCode,
      distance: Math.round(this.calculateDistance(lat, lng, nearbyStore.lat, nearbyStore.lng))
    };
  }

  async findAll(page = 1, limit = 20, merchantId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (merchantId) {
      where.store = { merchantId };
    }

    const [data, total] = await Promise.all([
      this.prisma.narration.findMany({
        skip,
        take: limit,
        where,
        include: { 
          language: true,
          store: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.narration.count(),
    ]);
    return { data, total, page, limit };
  }

  async recordListen(userId: string, narrationId: string, source: 'gps' | 'qr' = 'gps') {
    const narration = await this.prisma.narration.findUnique({
      where: { id: narrationId },
      include: { store: true },
    });
    if (!narration) throw new NotFoundException('Narration không tồn tại');

    return this.prisma.listenHistory.create({
      data: {
        userId,
        narrationId,
        storeId: narration.storeId,
        source: source === 'qr' ? 'qr' : 'gps',
      },
    });
  }

  async translateNarration(id: string, dto: any) {
    const narration = await this.prisma.narration.findUnique({
      where: { id },
      include: { language: true, store: true },
    });
    if (!narration) throw new NotFoundException('Narration không tồn tại');

    // Giả sử dto có targetLanguageCode
    const targetLangCode = dto.targetLanguageCode || 'en';
    const translatedText = await this.translateText(narration.textContent || '', narration.language.code, targetLangCode);

    if (dto.save) {
      const targetLang = await this.prisma.language.findUnique({ where: { code: targetLangCode } });
      if (!targetLang) throw new NotFoundException(`Ngôn ngữ ${targetLangCode} chưa được hỗ trợ`);

      return this.prisma.narration.upsert({
        where: { storeId_languageId: { storeId: narration.storeId, languageId: targetLang.id } },
        update: { textContent: translatedText },
        create: {
          storeId: narration.storeId,
          languageId: targetLang.id,
          textContent: translatedText,
          isActive: true,
        },
      });
    }

    return {
      originalId: id,
      targetLanguage: targetLangCode,
      translatedText,
    };
  }

  async update(id: string, user: { id: string; role: string }, dto: UpdateNarrationDto) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, user);
    return this.prisma.narration.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: { id: string; role: string }) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, user);
    await this.prisma.narration.delete({ where: { id } });
    return { success: true, message: 'Đã xóa narration' };
  }
}
