import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Thêm ngôn ngữ mới' })
  create(@Body() dto: CreateLanguageDto) {
    return this.languagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Cập nhật ngôn ngữ' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateLanguageDto>) {
    return this.languagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Xóa ngôn ngữ' })
  remove(@Param('id') id: string) {
    return this.languagesService.remove(id);
  }

  @Post('translate')
  @ApiOperation({ summary: 'Dịch văn bản thuyết minh và lưu vào DB (Public)' })
  translate(@Body() body: { text: string; targetLang?: string; toLang?: string; storeId?: string }) {
    const to = body.toLang || body.targetLang;
    return this.languagesService.translateText(body.text, to, body.storeId);
  }
}



