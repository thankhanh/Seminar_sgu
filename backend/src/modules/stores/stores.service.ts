import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

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
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'all') {
      // No status filter
    } else if (status) {
      where.status = status;
    } else {
      where.status = 'active'; // Default for public
    }

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true, name: true, address: true, lat: true, lng: true,
          openTime: true, closeTime: true, coverImage: true, status: true,
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

    console.log('Update payload for store:', id, dto);

    const { merchantId, ...updateData } = dto;
    const updatedStore = await this.prisma.store.update({ 
      where: { id }, 
      data: {
        ...updateData,
        status: updateData.status as any,
      } 
    });
    console.log('Update SUCCESS for store:', id, updatedStore);
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
