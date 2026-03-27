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
exports.MerchantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const merchant_subscriptions_service_1 = require("../merchant-subscriptions/merchant-subscriptions.service");
const client_1 = require("@prisma/client");
let MerchantService = class MerchantService {
    constructor(prisma, merchantSubscriptionsService) {
        this.prisma = prisma;
        this.merchantSubscriptionsService = merchantSubscriptionsService;
    }
    async register(userId, dto) {
        const existing = await this.prisma.merchant.findUnique({ where: { userId } });
        if (existing)
            throw new common_1.ConflictException('Bạn đã đăng ký làm merchant rồi');
        const merchant = await this.prisma.merchant.create({
            data: {
                userId,
                businessName: dto.businessName,
                taxCode: dto.taxCode,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'merchant', isActive: false },
        });
        return merchant;
    }
    async getMyMerchant(userId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
            include: {
                stores: true,
                merchantSubscriptions: {
                    where: { status: 'active' },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!merchant)
            throw new common_1.NotFoundException('Bạn chưa đăng ký làm merchant');
        return merchant;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.merchant.findMany({
                skip,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.merchant.count(),
        ]);
        return { data, total, page, limit };
    }
    async approveMerchant(id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant không tồn tại');
        await this.prisma.user.update({
            where: { id: merchant.userId },
            data: { isActive: true }
        });
        const updatedMerchant = await this.prisma.merchant.update({
            where: { id },
            data: { status: 'approved' },
        });
        await this.merchantSubscriptionsService.activatePlan(merchant.id, client_1.MerchantPlan.starter);
        return updatedMerchant;
    }
    async rejectMerchant(id, reason) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant không tồn tại');
        return this.prisma.merchant.update({
            where: { id },
            data: { status: 'rejected', rejectReason: reason },
        });
    }
};
exports.MerchantService = MerchantService;
exports.MerchantService = MerchantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        merchant_subscriptions_service_1.MerchantSubscriptionsService])
], MerchantService);
//# sourceMappingURL=merchant.service.js.map