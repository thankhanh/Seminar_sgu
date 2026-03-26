import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NarrationsService } from './narrations.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { TranslateNarrationDto } from './dto/translate-narration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Narrations')
@Controller()
export class NarrationsController {
  constructor(private readonly narrService: NarrationsService) {}

  @Post('stores/:storeId/narrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo narration cho store (merchant owner)' })
  create(
    @Param('storeId') storeId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNarrationDto,
  ) {
    return this.narrService.create(storeId, user.id, dto);
  }

  @Get('stores/:storeId/narrations')
  @ApiOperation({ summary: 'Danh sách narration của store (public)' })
  findByStore(@Param('storeId') storeId: string) {
    return this.narrService.findByStore(storeId);
  }

<<<<<<< Updated upstream
  @Get('nearby')
  @ApiOperation({ summary: 'Tìm narrations gần nhất dựa trên vị trí (public)' })
  @ApiQuery({ name: 'lat', required: true, type: Number, example: 10.7769 })
  @ApiQuery({ name: 'lng', required: true, type: Number, example: 106.7009 })
  @ApiQuery({ name: 'language', required: false, type: String, example: 'vi' })
  @ApiQuery({ name: 'radius', required: false, type: Number, example: 1, description: 'Bán kính tìm kiếm (km)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('language') language = 'vi',
    @Query('radius') radius = 1,
    @Query('limit') limit = 10,
  ) {
    return this.narrService.findNearbyNarrations(+lat, +lng, language, +radius, +limit);
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
=======
  @Post('narrations/:id/translate')
  @ApiOperation({
    summary: 'Dịch nội dung thuyết minh sang ngôn ngữ khác',
    description:
      'Nhận narration ID, dịch textContent từ ngôn ngữ gốc sang ngôn ngữ đích. ' +
      'Có thể tùy chọn lưu bản dịch thành narration mới.',
  })
  translateNarration(
    @Param('id') id: string,
    @Body() dto: TranslateNarrationDto,
  ) {
    return this.narrService.translateNarration(id, dto);
>>>>>>> Stashed changes
  }

  @Patch('narrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật narration (merchant owner)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateNarrationDto,
  ) {
    return this.narrService.update(id, user.id, dto);
  }

  @Delete('narrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa narration (merchant owner)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.narrService.remove(id, user.id);
  }
}
