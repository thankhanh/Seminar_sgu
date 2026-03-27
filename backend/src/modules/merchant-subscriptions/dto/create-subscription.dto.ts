import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MerchantPlan } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsEnum(MerchantPlan)
  @IsNotEmpty()
  plan: MerchantPlan;
}
