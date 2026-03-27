import { Module } from '@nestjs/common';
import { MerchantSubscriptionsService } from './merchant-subscriptions.service';
import { MerchantSubscriptionsController } from './merchant-subscriptions.controller';
import { PlanMetadataModule } from '../plan-metadata/plan-metadata.module';

@Module({
  imports: [PlanMetadataModule],
  providers: [MerchantSubscriptionsService],
  controllers: [MerchantSubscriptionsController],
  exports: [MerchantSubscriptionsService],
})
export class MerchantSubscriptionsModule {}
