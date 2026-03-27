import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MerchantSubscriptionsModule } from '../merchant-subscriptions/merchant-subscriptions.module';

@Module({
  imports: [MerchantSubscriptionsModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard, Reflector],
  exports: [AdminService],
})
export class AdminModule {}
