import {
  Controller, Post, Get, Body, HttpCode, HttpStatus,
  Res, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Cookie helper ────────────────────────────────────────────
  private setCookies(res: Response, accessToken: string, refreshToken?: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
    }
  }

  private clearCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const opts = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.clearCookie('access_token', opts);
    res.clearCookie('refresh_token', opts);
  }

  // ─── Register ────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // ← 201
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 lần / phút
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  // ─── Login ───────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 lần / phút
  @ApiOperation({ summary: 'Đăng nhập' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  // ─── Refresh ─────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token (rotation)' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = dto.refreshToken || req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Không có refresh token');

    const result = await this.authService.refreshToken(token);
    // Set cả access + refresh mới (rotation)
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  // ─── Logout ──────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất, xóa token session/cookies và blacklist refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    await this.authService.logout(refreshToken); // xóa token khỏi DB
    this.clearCookies(res);
    return { success: true, message: 'Đăng xuất thành công' };
  }

  // ─── Me ──────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  getMe(@CurrentUser() user: { id: string; email: string; role: string }) {
    return { user };
  }
}
