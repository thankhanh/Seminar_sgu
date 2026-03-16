import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected to PostgreSQL');
    } catch (error) {
      this.logger.warn(
        '⚠️  Không thể kết nối PostgreSQL — hãy kiểm tra DATABASE_URL trong .env',
      );
      this.logger.warn(
        '   Server vẫn chạy, nhưng các API cần DB sẽ trả lỗi 500.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
