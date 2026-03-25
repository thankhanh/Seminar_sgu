import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo store mới (merchant only)' })
  create(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách store (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storesService.findAll(+page, +limit);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Tìm stores gần nhất dựa trên vị trí (public)' })
  @ApiQuery({ name: 'lat', required: true, type: Number, example: 10.7769 })
  @ApiQuery({ name: 'lng', required: true, type: Number, example: 106.7009 })
  @ApiQuery({ name: 'radius', required: false, type: Number, example: 5, description: 'Bán kính tìm kiếm (km)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5,
    @Query('limit') limit = 20,
  ) {
    return this.storesService.findNearby(+lat, +lng, +radius, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết store (public)' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật store (merchant owner)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa store (merchant owner)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.storesService.remove(id, user.id);
  }
}
