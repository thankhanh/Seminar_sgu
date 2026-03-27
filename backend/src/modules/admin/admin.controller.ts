import { Controller, Get, Post, Body, Query, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RejectMerchantDto } from './dto/reject-merchant.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users')
  @ApiOperation({ summary: '[Admin] Khởi tạo tài khoản mới' })
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Get('users')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả người dùng' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllUsers(+page, +limit);
  }

  @Get('merchants')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả merchant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllMerchants(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllMerchants(+page, +limit);
  }

  @Patch('merchants/:id/approve')
  @ApiOperation({ summary: '[Admin] Duyệt merchant' })
  approveMerchant(@Param('id') id: string) {
    return this.adminService.approveMerchant(id);
  }

  @Patch('merchants/:id/reject')
  @ApiOperation({ summary: '[Admin] Từ chối merchant (kèm lý do)' })
  rejectMerchant(@Param('id') id: string, @Body() dto: RejectMerchantDto) {
    return this.adminService.rejectMerchant(id, dto.reason);
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: '[Admin] Bật/tắt tài khoản user' })
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('stats')
  @ApiOperation({ summary: '[Admin] Thống kê Dashboard' })
  getStats() {
    return this.adminService.getStats();
  }
}
