import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { haversineDistance } from '../../common/utils/haversine.util';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(user: { id: string; role: string }, dto: CreateStoreDto) {
    let merchantId: string;

    if (user.role === 'admin') {
      if (!dto.merchantId) {
        throw new ForbiddenException('Admin phải cung cấp merchantId để tạo store');
      }
      merchantId = dto.merchantId;
    } else {
      const merchant = await this.prisma.merchant.findUnique({ where: { userId: user.id } });
      if (!merchant) throw new ForbiddenException('Bạn chưa đăng ký làm merchant');
      merchantId = merchant.id;
    }

    // Kiểm tra giới hạn POI dựa trên gói đăng ký
    const [currentCount, activeSub] = await Promise.all([
      this.prisma.store.count({ where: { merchantId } }),
      this.prisma.merchantSubscription.findFirst({
        where: { merchantId, status: 'active' },
      }),
    ]);

    const maxStore = activeSub ? activeSub.maxStore : 1; // Mặc định 1 POI nếu chưa có gói

    if (currentCount >= maxStore) {
      throw new ForbiddenException(
        `Bạn đã đạt giới hạn tối đa ${maxStore} cửa hàng cho gói hiện tại. Vui lòng nâng cấp gói dịch vụ để thêm mới.`
      );
    }

    return this.prisma.store.create({
      data: {
        merchantId,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
        coverImage: dto.coverImage,
        status: (user.role === 'admin' ? dto.status : 'pending') as any,
        images: dto.images ? {
          createMany: {
            data: dto.images.map((url, index) => ({
              imageUrl: url,
              sortOrder: index,
            })),
          },
        } : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: string, merchantId?: string, keyword?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'all') {
      // No status filter
    } else if (status) {
      where.status = status;
    } else {
      where.status = 'active'; // Default for public
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (keyword) {
      where.name = {
        contains: keyword,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        where,
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
          _count: {
            select: { menus: true, narrations: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where }),
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

    // Tính khoảng cách và lọc trong bán kính
    const nearbyStores = stores
      .map(store => ({
        ...store,
        distance: haversineDistance(lat, lng, store.lat, store.lng),
      }))
      .filter(store => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return { data: nearbyStores, userLat: lat, userLng: lng, radiusKm, total: nearbyStores.length };
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

  async update(id: string, user: { id: string; role: string }, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');

    // Admin có quyền sửa mọi store. Merchant chỉ sửa store của mình.
    if (user.role !== 'admin' && store.merchant.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa store này');
    }

    const { merchantId, images, ...updateData } = dto;
    
    // For merchant, we filter out the status field to prevent self-approval
    if (user.role !== 'admin') {
      delete (updateData as any).status;
    }

    const updatedStore = await this.prisma.store.update({ 
      where: { id }, 
      data: {
        ...updateData,
        status: (updateData as any).status ? (updateData as any).status as any : undefined,
        images: images ? {
          deleteMany: {},
          createMany: {
            data: images.map((url, index) => ({
              imageUrl: url,
              sortOrder: index,
            })),
          },
        } : undefined,
      } 
    });
    return updatedStore;
  }

  async remove(id: string, user: { id: string; role: string }) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!store) throw new NotFoundException('Store không tồn tại');

    // Admin có quyền xóa mọi store. Merchant chỉ xóa store của mình.
    if (user.role !== 'admin' && store.merchant.userId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xóa store này');
    }

    await this.prisma.store.delete({ where: { id } });
    return { success: true, message: 'Đã xóa store' };
  }
}
