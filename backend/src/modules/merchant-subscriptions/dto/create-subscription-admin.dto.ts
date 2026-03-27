import { IsEnum, IsNotEmpty, IsEmail } from 'class-validator';
import { MerchantPlan } from '@prisma/client';

export class CreateMerchantSubscriptionAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(MerchantPlan)
  @IsNotEmpty()
  plan: MerchantPlan;
}
