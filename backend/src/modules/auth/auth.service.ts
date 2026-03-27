import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRole, MerchantStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // ─── Register ────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: dto.role ?? 'user',
        isActive: (dto.role === 'merchant') ? false : true,
        preferredLanguage: dto.preferredLanguage ?? 'vi',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Không tạo Token cho Merchant mới đăng ký (vì đang chờ duyệt)
    const tokens = user.role === 'merchant' ? null : await this.generateTokens(user.id, user.email, user.role);

    // Nếu là merchant, tạo bản ghi Merchant ở trạng thái chờ duyệt
    if (user.role === 'merchant') {
      await this.prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: dto.businessName || `${user.name}'s Business`,
          taxCode: dto.taxCode,
          status: 'pending' as MerchantStatus,
        },
      });
    }

    return { 
      user, 
      ...tokens,
      message: user.role === 'merchant' ? 'Tài khoản đang chờ duyệt. Vui lòng đăng nhập sau khi được phê duyệt.' : undefined 
    };
  }

  // ─── Login ───────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const { passwordHash, ...safeUser } = user;
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: safeUser, ...tokens };
  }

  // ─── Refresh Token (Rotation) ─────────────────────────────────
  async refreshToken(token: string) {
    // 1. Verify chữ ký JWT
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // 2. Kiểm tra token có trong DB không (blacklist detect)
    // Tìm theo userId rồi verify từng hash — dùng findFirst vì không lưu plain token
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });

    let matched: (typeof storedTokens)[number] | undefined;
    for (const t of storedTokens) {
      if (await bcrypt.compare(token, t.tokenHash)) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      // Token không tồn tại trong DB → có thể bị đánh cắp và đã dùng trước đó
      // Revoke toàn bộ refresh token của user để bảo vệ
      await this.revokeAllUserTokens(payload.sub);
      throw new UnauthorizedException('Refresh token không hợp lệ — tất cả phiên đã bị thu hồi');
    }

    // 3. Kiểm tra user còn active không
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      await this.prisma.refreshToken.delete({ where: { id: matched.id } });
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // 4. Xóa token cũ (rotation — mỗi lần refresh chỉ dùng 1 lần)
    await this.prisma.refreshToken.delete({ where: { id: matched.id } });

    // 5. Issue cặp token mới
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return tokens;
  }

  // ─── Logout ───────────────────────────────────────────────────
  async logout(refreshToken?: string) {
    if (refreshToken) {
      // Xóa đúng refresh token đã dùng
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: { expiresAt: { gt: new Date() } },
        // Không query tất cả, chỉ query 100 gần nhất để tránh full scan
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
      for (const t of storedTokens) {
        if (await bcrypt.compare(refreshToken, t.tokenHash)) {
          await this.prisma.refreshToken.delete({ where: { id: t.id } });
          break;
        }
      }
    }
  }

  // ─── Revoke all tokens của một user ──────────────────────────
  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // ─── Private: Generate & lưu tokens ─────────────────────────
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    });

    // Lưu hash của refresh token vào DB
    const tokenHash = await bcrypt.hash(refreshToken, 8); // rounds=8 đủ cho hash token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    // Giới hạn tối đa 5 refresh token đồng thời / user (multi-device)
    const existingTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (existingTokens.length >= 5) {
      // Xóa token cũ nhất
      await this.prisma.refreshToken.delete({ where: { id: existingTokens[0].id } });
    }

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
