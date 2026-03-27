import { forwardRef, Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MerchantSubscriptionsModule } from '../merchant-subscriptions/merchant-subscriptions.module';

@Module({
  imports: [forwardRef(() => MerchantSubscriptionsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
