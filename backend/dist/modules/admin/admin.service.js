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
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
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
                    user: { select: { id: true, name: true, email: true } },
                    stores: { select: { id: true, name: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.merchant.count(),
        ]);
        return { data, total, page, limit };
    }
    async approveMerchant(id) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map