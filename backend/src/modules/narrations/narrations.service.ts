import { Injectable, NotFoundException, ForbiddenException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class NarrationsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    // Khởi tạo Gemini AI (API Key được lấy từ .env)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

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
   * Dịch thuật nội dung sử dụng Google Gemini AI
   */
  private async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!this.model) {
      console.warn('[Gemini] API Key chưa được cấu hình. Trả về text gốc.');
      return text;
    }

    try {
      // Prompt được tối ưu cho du lịch và ẩm thực
      const prompt = `Bạn là một biên dịch viên chuyên nghiệp về du lịch và ẩm thực. 
      Hãy dịch đoạn giới thiệu quán ăn sau từ ${sourceLang} sang mã ngôn ngữ ${targetLang}. 
      Yêu cầu: Dịch tự nhiên, cuốn hút, giữ đúng ý nghĩa văn hóa và sự thân thiện. 
      Chỉ trả về đoạn văn bản đã dịch, không thêm lời dẫn giải hay dấu ngoặc kép.
      Nội dung cần dịch: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let translatedText = response.text();

      // Dọn dẹp dấu ngoặc kép nếu AI tự thêm vào
      translatedText = translatedText.replace(/^"|"$/g, '').trim();
      
      console.log(`[Gemini AI] Đã dịch xong sang ${targetLang}: "${translatedText.substring(0, 30)}..."`);
      return translatedText;
    } catch (error) {
      console.error('Lỗi khi gọi Gemini API:', error);
      return text; // Fallback: trả về text gốc nếu lỗi
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
