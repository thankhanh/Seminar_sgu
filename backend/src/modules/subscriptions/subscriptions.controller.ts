import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateUserSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Post('admin/grant')
  @Roles('admin')
  async grant(@Body() dto: CreateUserSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Post('switch')
  @Roles('user')
  async switchPlan(@Request() req, @Body('plan') plan: string) {
    return this.subscriptionsService.switchPlan(req.user.id, plan as any);
  }

  @Get('my')
  @Roles('user', 'merchant', 'admin')
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
  @Roles('admin')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
