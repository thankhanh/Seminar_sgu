import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';

@ApiTags('Qr')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}
}
