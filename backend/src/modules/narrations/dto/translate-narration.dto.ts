import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslateNarrationDto {
  @ApiProperty({
    example: 'en',
    description: 'Mã ngôn ngữ đích cần dịch sang (vd: en, vi, ja, ko, zh, fr)',
  })
  @IsString()
  targetLanguageCode: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Nếu true, sẽ lưu bản dịch thành narration mới cho ngôn ngữ đích. ' +
      'Nếu false hoặc không truyền, chỉ trả về text đã dịch mà không lưu.',
  })
  @IsOptional()
  @IsBoolean()
  saveAsNew?: boolean;
}
