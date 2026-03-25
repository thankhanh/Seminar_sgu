import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('QR')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate/:storeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo QR code cho store (merchant owner)' })
  generateQr(
    @Param('storeId') storeId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.qrService.generateQr(storeId, user.id);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Resolve QR code → thông tin store (public)' })
  resolveQr(@Param('code') code: string) {
    return this.qrService.resolveQr(code);
  }

  @Post('scan/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scan QR code và ghi nhận listen (user)' })
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
