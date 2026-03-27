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

  @ApiPropertyOptional({ enum: SubscriptionTypeEnum, example: SubscriptionTypeEnum.USER_MONTHLY })
  @IsOptional()
  @IsEnum(SubscriptionTypeEnum)
  type?: SubscriptionTypeEnum;

  @ApiPropertyOptional({ example: 50000, description: 'Số tiền thanh toán tự do' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  amount?: number;

  @ApiPropertyOptional({ example: 'Thanh toan gio hang', description: 'Noi dung thanh toan custom' })
  @IsOptional()
  @IsString()
  orderInfo?: string;

  @ApiPropertyOptional({ example: 49000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({ example: 'Thanh toán đơn hàng #123' })
  @IsOptional()
  @IsString()
  orderInfo?: string;

  @ApiPropertyOptional({ example: '127.0.0.1', description: 'IP người dùng (dùng cho VNPay)' })
  @IsOptional()
  @IsString()
  ipAddr?: string;
}
