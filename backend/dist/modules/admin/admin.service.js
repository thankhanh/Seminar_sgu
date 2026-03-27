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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const bcrypt = require("bcryptjs");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã được sử dụng bởi tài khoản khác');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                phone: dto.phone,
                role: dto.role,
                isActive: dto.role === 'merchant' ? false : true,
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (dto.role === 'merchant') {
            await this.prisma.merchant.create({
                data: {
                    userId: user.id,
                    businessName: `${user.name}'s Business`,
                    status: 'pending',
                },
            });
        }
        return user;
    }
    async getAllUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true, name: true, email: true, phone: true,
                    role: true, isActive: true, createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { data, total, page, limit };
    }
    async getAllMerchants(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.merchant.findMany({
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    stores: { select: { id: true, name: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.merchant.count(),
        ]);
        return { data, total, page, limit };
    }
    async approveMerchant(id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            return null;
        await this.prisma.user.update({
            where: { id: merchant.userId },
            data: { isActive: true }
        });
        return this.prisma.merchant.update({
            where: { id },
            data: { status: 'approved' },
        });
    }
    async rejectMerchant(id, reason) {
        return this.prisma.merchant.update({
            where: { id },
            data: { status: 'rejected', rejectReason: reason },
        });
    }
    async toggleUserActive(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user?.isActive },
            select: { id: true, name: true, email: true, isActive: true },
        });
    }
    async getStats() {
        const [userCount, merchantCount, storeCount, transactionCount, totalRevenue] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.merchant.count(),
            this.prisma.store.count(),
            this.prisma.transaction.count(),
            this.prisma.transaction.aggregate({
                where: { status: 'success' },
                _sum: { amount: true },
            }),
        ]);
        return {
            userCount,
            merchantCount,
            storeCount,
            transactionCount,
            totalRevenue: totalRevenue._sum.amount || 0,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map