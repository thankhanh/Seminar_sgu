import { Module } from '@nestjs/common';
import { ListenHistoryService } from './listen-history.service';
import { ListenHistoryController } from './listen-history.controller';

@Module({
  controllers: [ListenHistoryController],
  providers: [ListenHistoryService],
  exports: [ListenHistoryService],
})
export class ListenHistoryModule {}
