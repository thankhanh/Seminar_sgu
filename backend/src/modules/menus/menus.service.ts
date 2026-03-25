import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
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

  async create(storeId: string, userId: string, dto: CreateMenuDto) {
    await this.verifyStoreOwner(storeId, userId);
    return this.prisma.menu.create({
      data: {
        storeId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async findByStore(storeId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store không tồn tại');
    return this.prisma.menu.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu item không tồn tại');
    await this.verifyStoreOwner(menu.storeId, userId);
    return this.prisma.menu.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu item không tồn tại');
    await this.verifyStoreOwner(menu.storeId, userId);
    await this.prisma.menu.delete({ where: { id } });
    return { success: true, message: 'Đã xóa menu item' };
  }
}
