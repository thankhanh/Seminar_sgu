import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}
}

