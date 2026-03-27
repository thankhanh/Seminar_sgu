import { IsString, IsOptional, IsNumber, MaxLength, IsDecimal, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStoreDto {
  @ApiProperty({ example: 'Quán Cà Phê Vĩnh Khánh' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Quán cà phê view đẹp' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsString()
  address: string;

  @ApiProperty({ example: 10.7769 })
  @IsNumber()
  @Type(() => Number)
  @Min(-90) @Max(90)
  lat: number;

  @ApiProperty({ example: 106.7009 })
  @IsNumber()
  @Type(() => Number)
  @Min(-180) @Max(180)
  lng: number;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  closeTime?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'merchant-uuid' })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'active', 'hidden'], example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: ['https://image1.jpg', 'https://image2.jpg'] })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
