import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ListenHistoryService } from './listen-history.service';
import { CreateListenHistoryDto } from './dto/create-listen-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Listen History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('listen-history')
export class ListenHistoryController {
  constructor(private readonly listenHistoryService: ListenHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Lưu lịch sử nghe thuyết minh' })
  async create(@Request() req: any, @Body() dto: CreateListenHistoryDto) {
    const history = await this.listenHistoryService.create(req.user.id, dto);
    return {
      success: true,
      data: history,
    };
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Lấy lịch sử nghe của người dùng tại một cửa hàng' })
  async findByStore(@Request() req: any, @Param('storeId') storeId: string) {
    const data = await this.listenHistoryService.findByStore(req.user.id, storeId);
    return {
      success: true,
      data,
    };
  }

  @Get('my')
  @ApiOperation({ summary: 'Lấy tất cả lịch sử nghe của tôi' })
  async findByUser(@Request() req: any) {
    const data = await this.listenHistoryService.findByUser(req.user.id);
    return {
      success: true,
      data,
    };
  }
}
