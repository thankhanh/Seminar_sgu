import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';

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
    const store = await this.verifyStoreOwner(storeId, user);
    
    // Kiểm tra ngôn ngữ và gói đăng ký
    const [language, activeSub] = await Promise.all([
      this.prisma.language.findUnique({ where: { id: dto.languageId } }),
      this.prisma.merchantSubscription.findFirst({
        where: { merchantId: store.merchantId, status: 'active' },
      }),
    ]);

    if (!language) throw new NotFoundException('Ngôn ngữ không tồn tại');

    const isStarter = !activeSub || activeSub.plan === 'starter';
    const allowedStarterCodes = ['vi', 'en'];

    if (isStarter && !allowedStarterCodes.includes(language.code.toLowerCase())) {
      throw new ForbiddenException(
        'Gói Starter chỉ hỗ trợ thuyết minh tiếng Việt và tiếng Anh. Vui lòng nâng cấp gói để thêm ngôn ngữ khác.'
      );
    }

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
