import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectMerchantDto {
  @ApiPropertyOptional({ example: 'Hồ sơ không đầy đủ' })
  @IsOptional()
  @IsString()
  reason?: string;
}
