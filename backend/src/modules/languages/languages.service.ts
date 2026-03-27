import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả ngôn ngữ đang hoạt động
   */
  async findAll() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Lấy chi tiết ngôn ngữ theo ID, kèm số lượng narrations
   */
  async findOne(id: string) {
    const language = await this.prisma.language.findUnique({
      where: { id },
      include: {
        _count: { select: { narrations: true } },
      },
    });
    if (!language) throw new NotFoundException('Ngôn ngữ không tồn tại');
    return language;
  }

  /**
   * Tìm ngôn ngữ theo code (vd: 'vi', 'en', 'ja')
   */
  async findByCode(code: string) {
    const language = await this.prisma.language.findUnique({
      where: { code },
    });
    if (!language) throw new NotFoundException(`Ngôn ngữ "${code}" không tồn tại`);
    return language;
  }

  create(dto: CreateLanguageDto) {
    return this.prisma.language.create({
      data: dto,
    });
  }

  update(id: string, dto: Partial<CreateLanguageDto>) {
    return this.prisma.language.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.language.delete({
      where: { id },
    });
  }
}
