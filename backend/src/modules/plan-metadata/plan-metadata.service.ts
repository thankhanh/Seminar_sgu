import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PlanMetadataService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.planMetadata.findMany({
      orderBy: { planKey: 'asc' },
    });
  }

  async findByKey(planKey: string) {
    return this.prisma.planMetadata.findUnique({
      where: { planKey },
    });
  }

  async update(planKey: string, data: any) {
    return this.prisma.planMetadata.update({
      where: { planKey },
      data,
    });
  }
}
