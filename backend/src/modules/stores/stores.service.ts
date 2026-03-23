import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

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
}
