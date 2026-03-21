import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NarrationsService {
  constructor(private prisma: PrismaService) {}
}

