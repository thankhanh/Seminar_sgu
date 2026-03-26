import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLanguageDto {
  @ApiProperty({ example: 'Japanese' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'ja' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiPropertyOptional({ example: '🇯🇵' })
  @IsOptional()
  @IsString()
  flagIcon?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
