import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateListenHistoryDto } from './dto/create-listen-history.dto';

@Injectable()
export class ListenHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateListenHistoryDto) {
    return this.prisma.listenHistory.create({
      data: {
        userId,
        storeId: dto.storeId,
        narrationId: dto.narrationId,
        source: dto.source || 'gps',
      },
      include: {
        narration: {
          include: {
              language: true
          }
        }
      }
    });
  }

  async findByStore(userId: string, storeId: string) {
    return this.prisma.listenHistory.findMany({
      where: {
        userId,
        storeId,
      },
      include: {
        narration: {
          include: {
            language: true,
          },
        },
      },
      orderBy: {
        listenedAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.listenHistory.findMany({
      where: { userId },
      include: {
        store: true,
        narration: {
          include: {
            language: true,
          },
        },
      },
      orderBy: {
        listenedAt: 'desc',
      },
    });
  }
}
