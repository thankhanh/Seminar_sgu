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
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const uuid_1 = require("uuid");
let QrService = class QrService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateQr(storeId, userId) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (store.merchant.userId !== userId)
            throw new common_1.ForbiddenException('Bạn không có quyền tạo QR cho store này');
        const code = (0, uuid_1.v4)();
        const qr = await this.prisma.qrCode.create({
            data: {
                storeId,
                code,
                qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`,
                isActive: true,
            },
        });
        return qr;
    }
    async resolveQr(code) {
        const qr = await this.prisma.qrCode.findUnique({
            where: { code },
            include: {
                store: {
                    include: {
                        merchant: { select: { businessName: true } },
                        narrations: { include: { language: true } },
                        menus: true,
                    },
                },
            },
        });
        if (!qr || !qr.isActive)
            throw new common_1.NotFoundException('QR code không hợp lệ hoặc đã hết hạn');
        return { store: qr.store };
    }
    async getStoreQrCodes(storeId, userId) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (store.merchant.userId !== userId)
            throw new common_1.ForbiddenException('Bạn không có quyền xem QR của store này');
        return this.prisma.qrCode.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QrService);
//# sourceMappingURL=qr.service.js.map