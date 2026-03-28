import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ListenSource } from '@prisma/client';

export class CreateListenHistoryDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  narrationId: string;

  @IsEnum(ListenSource)
  @IsOptional()
  source?: ListenSource;
}
