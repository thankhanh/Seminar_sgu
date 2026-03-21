import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}
}

