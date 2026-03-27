"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../database/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email đã được sử dụng');
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
        const tokens = user.role === 'merchant' ? null : await this.generateTokens(user.id, user.email, user.role);
        if (user.role === 'merchant') {
            await this.prisma.merchant.create({
                data: {
                    userId: user.id,
                    businessName: dto.businessName || `${user.name}'s Business`,
                    taxCode: dto.taxCode,
                    status: 'pending',
                },
            });
        }
        return {
            user,
            ...tokens,
            message: user.role === 'merchant' ? 'Tài khoản đang chờ duyệt. Vui lòng đăng nhập sau khi được phê duyệt.' : undefined
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        const { passwordHash, ...safeUser } = user;
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: safeUser, ...tokens };
    }
    async refreshToken(token) {
        let payload;
        try {
            payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
        const storedTokens = await this.prisma.refreshToken.findMany({
            where: { userId: payload.sub, expiresAt: { gt: new Date() } },
        });
        let matched;
        for (const t of storedTokens) {
            if (await bcrypt.compare(token, t.tokenHash)) {
                matched = t;
                break;
            }
        }
        if (!matched) {
            await this.revokeAllUserTokens(payload.sub);
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ — tất cả phiên đã bị thu hồi');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) {
            await this.prisma.refreshToken.delete({ where: { id: matched.id } });
            throw new common_1.UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
        }
        await this.prisma.refreshToken.delete({ where: { id: matched.id } });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return tokens;
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const storedTokens = await this.prisma.refreshToken.findMany({
                where: { expiresAt: { gt: new Date() } },
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
    async revokeAllUserTokens(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload);
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: refreshExpiresIn,
        });
        const tokenHash = await bcrypt.hash(refreshToken, 8);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const existingTokens = await this.prisma.refreshToken.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        if (existingTokens.length >= 5) {
            await this.prisma.refreshToken.delete({ where: { id: existingTokens[0].id } });
        }
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map