import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
