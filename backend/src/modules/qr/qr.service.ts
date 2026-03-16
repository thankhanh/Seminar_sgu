import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}
}

