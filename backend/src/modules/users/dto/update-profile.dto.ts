import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '12345678', description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'vi', description: 'Ngôn ngữ ưa thích: vi, en, ...' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferredLanguage?: string;
}
