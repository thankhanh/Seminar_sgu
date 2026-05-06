import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
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
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.subscriptionsService.findAll(+page || 1, +limit || 10);
  }

  @Patch(':id')
  @Roles('admin')
  async updatePlan(@Param('id') id: string, @Body('plan') plan: string) {
    return this.subscriptionsService.updatePlan(id, plan as any);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'merchant')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }

  @Post('admin/grant')
  @Roles('admin')
  async grant(@Body() dto: any) {
    return this.subscriptionsService.grant(dto);
  }
}
