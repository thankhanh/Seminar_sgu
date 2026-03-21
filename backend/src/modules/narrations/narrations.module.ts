import { Module } from '@nestjs/common';
import { NarrationsController } from './narrations.controller';
import { NarrationsService } from './narrations.service';

@Module({
  controllers: [NarrationsController],
  providers: [NarrationsService],
  exports: [NarrationsService],
})
export class NarrationsModule {}
