import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách ngôn ngữ hỗ trợ (public)' })
  findAll() {
    return this.languagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết ngôn ngữ theo ID (public)' })
  findOne(@Param('id') id: string) {
    return this.languagesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Tìm ngôn ngữ theo code (vd: vi, en, ja)' })
  findByCode(@Param('code') code: string) {
    return this.languagesService.findByCode(code);
  }
}
