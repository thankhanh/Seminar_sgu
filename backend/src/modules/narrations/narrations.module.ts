import { Module } from '@nestjs/common';
import { NarrationsController } from './narrations.controller';
import { NarrationsService } from './narrations.service';
import { TranslationService } from '../../common/services/translation.service';

@Module({
  controllers: [NarrationsController],
  providers: [NarrationsService, TranslationService],
  exports: [NarrationsService],
})
export class NarrationsModule {}
