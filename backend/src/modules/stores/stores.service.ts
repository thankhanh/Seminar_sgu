import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { haversineDistance } from '../../common/utils/haversine.util';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateStoreDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new ForbiddenException('Bạn chưa đăng ký làm merchant');

    return this.prisma.store.create({
      data: {
        merchantId: merchant.id,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
        coverImage: dto.coverImage,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        where: { status: 'active' },
        select: {
          id: true, name: true, address: true, lat: true, lng: true,
          openTime: true, closeTime: true, coverImage: true, status: true,
          merchant: { select: { businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where: { status: 'active' } }),
    ]);
    return { data, total, page, limit };
  }

  /**
   * Tìm các stores gần vị trí GPS hiện tại
   * @param lat - Vĩ độ hiện tại
   * @param lng - Kinh độ hiện tại
   * @param radiusKm - Bán kính tìm kiếm (km), mặc định 5km
   * @param limit - Số lượng kết quả tối đa, mặc định 20
   */
  async findNearby(lat: number, lng: number, radiusKm = 5, limit = 20) {
    // Lấy tất cả stores active
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        openTime: true,
        closeTime: true,
        coverImage: true,
        status: true,
        merchant: { select: { businessName: true } },
      },
    });

    // Tính khoảng cách và lọc theo bán kính
    const storesWithDistance = stores
      .map((store) => ({
        ...store,
        distance: haversineDistance(lat, lng, store.lat, store.lng),
      }))
      .filter((store) => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return {
      data: storesWithDistance,
      total: storesWithDistance.length,
      centerLat: lat,
      centerLng: lng,
      radiusKm,
    };
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        merchant: { select: { businessName: true } },
        images: true,
        menus: true,
        narrations: { include: { language: true } },
      },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    return store;
  }

  async update(id: string, userId: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    if (store.merchant.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa store này');

    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');
    if (store.merchant.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa store này');

    await this.prisma.store.delete({ where: { id } });
    return { success: true, message: 'Đã xóa store' };
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

  async findNearby(lat: number, lng: number, radiusKm = 5, limit = 20) {
    // Lấy tất cả stores active
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
      select: {
        id: true, name: true, address: true, lat: true, lng: true,
        openTime: true, closeTime: true, coverImage: true,
        merchant: { select: { businessName: true } },
      },
    });

    // Tính khoảng cách và lọc trong bán kính
    const nearbyStores = stores
      .map(store => ({
        ...store,
        distance: this.calculateDistance(lat, lng, store.lat, store.lng),
      }))
      .filter(store => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return { data: nearbyStores, userLat: lat, userLng: lng, radiusKm };
  }
