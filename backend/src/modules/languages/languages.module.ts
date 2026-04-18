import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { TranslationService } from '../../common/services/translation.service';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, TranslationService],
  exports: [LanguagesService],
})
export class LanguagesModule {}

