import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNarrationDto {
  @ApiProperty({ example: 'lang-id-here' })
  @IsString()
  languageId: string;

  @ApiPropertyOptional({ example: 'https://...audio.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 'Đây là nội dung thuyết minh...' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ example: 120, description: 'Thời lượng tính bằng giây' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
