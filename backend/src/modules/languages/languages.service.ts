import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
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

