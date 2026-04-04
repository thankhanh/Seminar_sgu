import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NarrationsService } from './narrations.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Narrations')
@Controller()
export class NarrationsController {
  constructor(private readonly narrService: NarrationsService) {}

  @Post('stores/:storeId/narrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo narration cho store (merchant owner/admin)' })
  create(
    @Param('storeId') storeId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateNarrationDto,
  ) {
    return this.narrService.create(storeId, user, dto);
  }

  @Get('stores/:storeId/narrations')
  @ApiOperation({ summary: 'Danh sách narration của store (public)' })
  findByStore(@Param('storeId') storeId: string) {
    return this.narrService.findByStore(storeId);
  }

  /**
   * GET /nearby?lat=...&lng=...&lang=en
   * Tìm thuyết minh gần vị trí → tự động dịch sang ngôn ngữ app yêu cầu
   */
  @Get('nearby')
  @ApiOperation({
    summary: 'Tìm thuyết minh gần vị trí - tự động dịch sang ngôn ngữ yêu cầu',
    description:
      'Nhận tọa độ GPS và mã ngôn ngữ (vi/en/ja/ko/zh...). ' +
      'Backend tìm quán trong 100m, dịch nội dung VI → ngôn ngữ yêu cầu, ' +
      'lưu cache vào DB và trả về text để app đọc TTS.',
  })
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('lang') lang: string,
  ) {
    return this.narrService.findNearby(Number(lat), Number(lng), lang || 'vi');
  }

  @Get('narrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách tất cả narration (Admin)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.narrService.findAll(Number(page) || 1, Number(limit) || 20, merchantId);
  }

  @Post('listen/:narrationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ghi nhận việc nghe narration (user)' })
  @ApiQuery({ name: 'source', required: false, enum: ['gps', 'qr'], example: 'gps' })
  recordListen(
    @Param('narrationId') narrationId: string,
    @CurrentUser() user: { id: string },
    @Query('source') source: 'gps' | 'qr' = 'gps',
  ) {
    return this.narrService.recordListen(user.id, narrationId, source);
  }

  @Patch('narrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật narration (merchant owner/admin)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateNarrationDto,
  ) {
    return this.narrService.update(id, user, dto);
  }

  @Delete('narrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa narration (merchant owner/admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.narrService.remove(id, user);
  }
}
