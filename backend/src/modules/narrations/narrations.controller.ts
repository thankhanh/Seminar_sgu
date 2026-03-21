import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NarrationsService } from './narrations.service';

@ApiTags('Narrations')
@Controller('narrations')
export class NarrationsController {
  constructor(private readonly narrationsService: NarrationsService) {}
}
