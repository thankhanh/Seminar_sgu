import { Module } from '@nestjs/common';
import { MerchantSubscriptionsService } from './merchant-subscriptions.service';
import { MerchantSubscriptionsController } from './merchant-subscriptions.controller';
import { PlanMetadataModule } from '../plan-metadata/plan-metadata.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PlanMetadataModule],
  providers: [MerchantSubscriptionsService],
  controllers: [MerchantSubscriptionsController],
  exports: [MerchantSubscriptionsService],
})
export class MerchantSubscriptionsModule {}
