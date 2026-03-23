import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Merchant')
@Controller('merchant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký làm merchant (user → merchant)' })
  register(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterMerchantDto,
  ) {
    return this.merchantService.register(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Xem thông tin merchant của mình' })
  getMyMerchant(@CurrentUser() user: { id: string }) {
    return this.merchantService.getMyMerchant(user.id);
  }
}
