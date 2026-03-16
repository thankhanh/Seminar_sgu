import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}
}

