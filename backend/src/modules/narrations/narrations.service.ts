import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TranslationService } from '../../common/services/translation.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { TranslateNarrationDto } from './dto/translate-narration.dto';

@Injectable()
export class NarrationsService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  private async verifyStoreOwner(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    if (store.merchant.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền quản lý store này');
    return store;
  }

  async create(storeId: string, userId: string, dto: CreateNarrationDto) {
    await this.verifyStoreOwner(storeId, userId);

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

  async update(id: string, userId: string, dto: UpdateNarrationDto) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, userId);
    return this.prisma.narration.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const narration = await this.prisma.narration.findUnique({ where: { id } });
    if (!narration) throw new NotFoundException('Narration không tồn tại');
    await this.verifyStoreOwner(narration.storeId, userId);
    await this.prisma.narration.delete({ where: { id } });
    return { success: true, message: 'Đã xóa narration' };
  }

<<<<<<< Updated upstream
  // Hàm tính khoảng cách Haversine giữa hai điểm (đơn vị: km)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async findNearbyNarrations(lat: number, lng: number, languageCode = 'vi', radiusKm = 1, limit = 10) {
    // Tìm stores gần nhất
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, lat: true, lng: true },
    });

    const nearbyStores = stores
      .map(store => ({
        ...store,
        distance: this.calculateDistance(lat, lng, store.lat, store.lng),
      }))
      .filter(store => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    // Lấy narrations cho các stores này
    const storeIds = nearbyStores.map(s => s.id);
    const narrations = await this.prisma.narration.findMany({
      where: {
        storeId: { in: storeIds },
        isActive: true,
        language: { code: languageCode },
      },
      include: {
        store: { select: { name: true, address: true } },
        language: true,
      },
    });

    // Kết hợp với khoảng cách
    const result = narrations.map(narration => {
      const store = nearbyStores.find(s => s.id === narration.storeId);
      return {
        ...narration,
        distance: store?.distance || 0,
      };
    }).sort((a, b) => a.distance - b.distance);

    return { data: result, userLat: lat, userLng: lng, languageCode, radiusKm };
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
        storeId: narration.storeId,
        narrationId,
        source,
      },
    });
  }
=======
  /**
   * Dịch nội dung thuyết minh từ ngôn ngữ gốc sang ngôn ngữ đích.
   * Hỗ trợ tùy chọn lưu bản dịch thành narration mới.
   */
  async translateNarration(narrationId: string, dto: TranslateNarrationDto) {
    // 1. Tìm narration gốc
    const narration = await this.prisma.narration.findUnique({
      where: { id: narrationId },
      include: { language: true },
    });
    if (!narration) throw new NotFoundException('Narration không tồn tại');

    if (!narration.textContent || narration.textContent.trim().length === 0) {
      throw new BadRequestException('Narration này không có nội dung text để dịch');
    }

    // 2. Tìm ngôn ngữ đích
    const targetLanguage = await this.prisma.language.findFirst({
      where: { code: dto.targetLanguageCode, isActive: true },
    });
    if (!targetLanguage) {
      throw new NotFoundException(
        `Ngôn ngữ "${dto.targetLanguageCode}" không tồn tại hoặc chưa được kích hoạt`,
      );
    }

    // 3. Dịch text
    const sourceLanguageCode = narration.language.code;
    const result = await this.translationService.translate(
      narration.textContent,
      sourceLanguageCode,
      dto.targetLanguageCode,
    );

    // 4. Nếu yêu cầu lưu thành narration mới
    let savedNarration = null;
    if (dto.saveAsNew) {
      // Kiểm tra xem đã tồn tại narration cho ngôn ngữ đích chưa
      const existing = await this.prisma.narration.findUnique({
        where: {
          storeId_languageId: {
            storeId: narration.storeId,
            languageId: targetLanguage.id,
          },
        },
      });

      if (existing) {
        // Cập nhật narration hiện có
        savedNarration = await this.prisma.narration.update({
          where: { id: existing.id },
          data: { textContent: result.translatedText },
          include: { language: true },
        });
      } else {
        // Tạo narration mới
        savedNarration = await this.prisma.narration.create({
          data: {
            storeId: narration.storeId,
            languageId: targetLanguage.id,
            textContent: result.translatedText,
            duration: narration.duration,
            isActive: true,
          },
          include: { language: true },
        });
      }
    }

    return {
      originalText: narration.textContent,
      translatedText: result.translatedText,
      sourceLanguage: {
        code: sourceLanguageCode,
        name: narration.language.name,
      },
      targetLanguage: {
        code: dto.targetLanguageCode,
        name: targetLanguage.name,
      },
      saved: dto.saveAsNew ?? false,
      savedNarration,
    };
  }
}
>>>>>>> Stashed changes
