import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Menus')
@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('stores/:storeId/menus')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm món ăn vào store (merchant owner)' })
  create(
    @Param('storeId') storeId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateMenuDto,
  ) {
    return this.menusService.create(storeId, user, dto);
  }

  @Get('stores/:storeId/menus')
  @ApiOperation({ summary: 'Danh sách menu của store (public)' })
  findByStore(@Param('storeId') storeId: string) {
    return this.menusService.findByStore(storeId);
  }

  @Patch('menus/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật menu item (merchant owner)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, user, dto);
  }

  @Delete('menus/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa menu item (merchant owner)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.menusService.remove(id, user);
  }
}
