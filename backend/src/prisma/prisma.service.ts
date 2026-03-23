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
      const dbUrl = process.env.DATABASE_URL ?? '';
      const isSupabase = dbUrl.toLowerCase().includes('supabase.co');
      this.logger.log(
        `✅ ${isSupabase ? 'Connected to Supabase' : 'Prisma connected to PostgreSQL'} successfully`,
      );
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
