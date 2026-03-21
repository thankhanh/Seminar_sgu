import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}
}
