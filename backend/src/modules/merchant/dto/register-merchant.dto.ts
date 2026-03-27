import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterMerchantDto {
  @ApiProperty({ example: 'Công ty TNHH ABC' })
  @IsString()
  @MaxLength(200)
  businessName: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string;
}
