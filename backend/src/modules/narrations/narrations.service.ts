import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';

@Injectable()
export class NarrationsService {
  constructor(private prisma: PrismaService) {}

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
