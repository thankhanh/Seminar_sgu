import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantSubscriptionsService } from './merchant-subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('merchant-subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MerchantSubscriptionsController {
  constructor(private readonly subscriptionsService: MerchantSubscriptionsService) {}

  @Post()
  @Roles('merchant')
  async create(@Request() req, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(req.user.id, dto);
  }

  @Get('my')
  @Roles('merchant')
  async getMy(@Request() req) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lấy tất cả subscription (Admin only)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.subscriptionsService.findAll(+page, +limit);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật subscription (Admin only)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.subscriptionsService.update(id, dto);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'merchant')
  async cancel(@Param('id') id: string) {
  }
}
