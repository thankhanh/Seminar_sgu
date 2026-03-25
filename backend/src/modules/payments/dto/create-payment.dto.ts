import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentMethodEnum {
  VNPAY = 'vnpay',
  MOMO = 'momo',
}

export enum SubscriptionTypeEnum {
  USER_MONTHLY = 'user_monthly',
  USER_YEARLY = 'user_yearly',
  MERCHANT_STARTER = 'merchant_starter',
  MERCHANT_BUSINESS = 'merchant_business',
  MERCHANT_PREMIUM = 'merchant_premium',
}

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentMethodEnum, example: PaymentMethodEnum.VNPAY })
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @ApiProperty({ enum: SubscriptionTypeEnum, example: SubscriptionTypeEnum.USER_MONTHLY })
  @IsEnum(SubscriptionTypeEnum)
  type: SubscriptionTypeEnum;

  @ApiPropertyOptional({ example: '127.0.0.1', description: 'IP người dùng (dùng cho VNPay)' })
  @IsOptional()
  @IsString()
  ipAddr?: string;
}
