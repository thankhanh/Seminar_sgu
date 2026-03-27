import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('QR Codes')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('scan/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quét mã QR để nghe thuyết minh (User)' })
  scanQr(
    @Param('code') code: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.qrService.scanQr(code, user.id);
  }
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách QR codes của store (merchant owner)' })
  getStoreQrCodes(
    @Param('storeId') storeId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.qrService.getStoreQrCodes(storeId, user.id);
  }
}
