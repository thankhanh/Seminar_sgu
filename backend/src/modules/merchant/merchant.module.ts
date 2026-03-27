import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MerchantSubscriptionsModule } from '../merchant-subscriptions/merchant-subscriptions.module';

@Module({
  imports: [MerchantSubscriptionsModule],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
