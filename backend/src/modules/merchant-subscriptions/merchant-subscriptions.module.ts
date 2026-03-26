import { Module } from '@nestjs/common';
import { MerchantSubscriptionsService } from './merchant-subscriptions.service';
import { MerchantSubscriptionsController } from './merchant-subscriptions.controller';

@Module({
  providers: [MerchantSubscriptionsService],
  controllers: [MerchantSubscriptionsController],
  exports: [MerchantSubscriptionsService],
})
export class MerchantSubscriptionsModule {}
