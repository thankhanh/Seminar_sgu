import {
  Controller, Post, Get, Body, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentMethodEnum } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo yêu cầu thanh toán (VNPay hoặc MoMo)',
    description: 'Trả về `paymentUrl` để redirect người dùng đến trang thanh toán.',
  })
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    const ipAddr =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    if (dto.method === PaymentMethodEnum.VNPAY) {
      return this.paymentsService.createVnpayPayment(user.id, dto, ipAddr);
    }
    return this.paymentsService.createMomoPayment(user.id, dto);
  }

  // ─── VNPay ───────────────────────────────────────────────────

  @Get('vnpay/return')
  @ApiOperation({
    summary: 'VNPay Return URL — xử lý kết quả sau thanh toán',
    description: 'VNPay redirect người dùng về đây sau khi hoàn tất.',
  })
  vnpayReturn(@Query() query: Record<string, string>) {
    return this.paymentsService.handleVnpayReturn(query);
  }

  @Post('vnpay/ipn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'VNPay IPN — nhận thông báo bất đồng bộ từ VNPay',
    description: 'VNPay server gọi endpoint này để xác nhận kết quả giao dịch.',
  })
  vnpayIpn(@Query() query: Record<string, string>) {
    return this.paymentsService.handleVnpayIpn(query);
  }

  // ─── MoMo ────────────────────────────────────────────────────

  @Post('momo/ipn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'MoMo IPN — nhận thông báo bất đồng bộ từ MoMo',
    description: 'MoMo server gọi endpoint này để xác nhận kết quả giao dịch.',
  })
  momoIpn(@Body() body: Record<string, any>) {
    return this.paymentsService.handleMomoIpn(body);
  }

  @Get('momo/return')
  @ApiOperation({
    summary: 'MoMo Return URL — xử lý kết quả trả về từ MoMo',
  })
  momoReturn(@Query() query: Record<string, string>) {
    // MoMo redirect người dùng về redirectUrl của frontend, backend chỉ xử lý nếu cần
    return { message: 'Vui lòng kiểm tra kết quả từ IPN', query };
  }

  // ─── Lịch sử ─────────────────────────────────────────────────

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lịch sử giao dịch của người dùng' })
  getHistory(@CurrentUser() user: { id: string }) {
    return this.paymentsService.getTransactionHistory(user.id);
  }
}
