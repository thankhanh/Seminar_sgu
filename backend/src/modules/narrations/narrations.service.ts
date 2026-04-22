import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { deleteFile } from '../../common/utils/file.util';

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
   * Dịch thuật văn bản bằng MyMemory API (Miễn phí, không cần API Key)
   * Hỗ trợ: vi, en, ja, ko, zh, fr, th, de, es...
   */
  private async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Nếu cùng ngôn ngữ, trả về luôn
    if (sourceLang === targetLang) return text;

    // Map mã ngôn ngữ sang format MyMemory (zh-CN thay vì zh)
    const LANG_MAP: Record<string, string> = {
      zh: 'zh-CN',
      'zh-CN': 'zh-CN',
    };
    const src = LANG_MAP[sourceLang] ?? sourceLang;
    const tgt = LANG_MAP[targetLang] ?? targetLang;

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json() as any;

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText.trim();
        console.log(`[Translation] ${src} → ${tgt}: "${translated.substring(0, 40)}..."`);
        return translated;
      }

      console.warn('[Translation] Không dịch được, dùng text gốc:', data.responseDetails);
      return text;
    } catch (error) {
      console.error('[Translation] Lỗi khi gọi MyMemory API:', error);
      return text; // Fallback: trả về text gốc nếu lỗi mạng
    }
  }

  /**
   * Tìm thuyết minh gần vị trí hiện tại của app (Có tích hợp Tự động dịch thuật và Caching)
   */
  async findNearby(lat: number, lng: number, targetLangCode: string) {
    // 1. Tìm cửa hàng gần nhất (bán kính 100m)
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
    });

    const radius = 100;
    const nearbyStore = stores.find(store => {
      const distance = this.calculateDistance(lat, lng, store.lat, store.lng);
      return distance <= radius;
    });

    if (!nearbyStore) {
      return { found: false, message: 'Không tìm thấy địa điểm thuyết minh nào trong phạm vi 100m' };
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

    // 2. Xác định giới hạn dựa trên plan
    let limit = 10; // Mặc định Free là 10
    if (subscription) {
      if (subscription.plan === 'yearly') limit = Infinity;
      else if (subscription.plan === 'monthly') limit = 30;
    }

    // 3. Đếm số lượt đã nghe trong ngày hôm nay
    if (limit !== Infinity) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const count = await this.prisma.listenHistory.count({
        where: {
          userId,
          listenedAt: { gte: todayStart },
        },
      });

      if (count >= limit) {
        throw new ForbiddenException(`Đã đạt giới hạn ${limit} lần nghe/ngày. Nâng cấp gói để nghe không giới hạn!`);
      }
    }

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


  async update(id: string, user: { id: string; role: string }, dto: UpdateNarrationDto) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, user);

    // Xóa file âm thanh cũ nếu có bản mới thay thế
    if (dto.audioUrl && narration.audioUrl && dto.audioUrl !== narration.audioUrl) {
      await deleteFile(narration.audioUrl);
    }

    return this.prisma.narration.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: { id: string; role: string }) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, user);
    
    // Xóa file vật lý
    if (narration.audioUrl) {
      await deleteFile(narration.audioUrl);
    }

    await this.prisma.narration.delete({ where: { id } });
    return { success: true, message: 'Đã xóa narration và file âm thanh liên quan' };
  }
}
