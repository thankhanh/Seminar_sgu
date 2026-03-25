import { PartialType } from '@nestjs/mapped-types';
import { CreateNarrationDto } from './create-narration.dto';

export class UpdateNarrationDto extends PartialType(CreateNarrationDto) {}
