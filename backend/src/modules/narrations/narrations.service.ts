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
}
