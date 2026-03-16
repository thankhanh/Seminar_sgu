import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';

@ApiTags('Merchant')
@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}
}
