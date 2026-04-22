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
    summary: 'Tạo yêu cầu thanh toán (MoMo)',
    description: 'Trả về `paymentUrl` để redirect người dùng đến trang thanh toán.',
  })
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.createMomoPayment(user.id, dto);
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

  // ─── Kiểm tra trạng thái ────────────────────────────────────

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái giao dịch',
    description: 'App polling endpoint này để biết kết quả thanh toán MoMo.',
  })
  getStatus(
    @CurrentUser() user: { id: string },
    @Query('transactionId') transactionId: string,
  ) {
    return this.paymentsService.getTransactionStatus(transactionId, user.id);
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
