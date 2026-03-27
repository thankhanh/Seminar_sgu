import { IsEnum, IsNotEmpty, IsEmail } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class CreateUserSubscriptionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  plan: SubscriptionPlan;
}
