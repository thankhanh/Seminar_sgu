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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const haversine_util_1 = require("../../common/utils/haversine.util");
let StoresService = class StoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
        if (!merchant)
            throw new common_1.ForbiddenException('Bạn chưa đăng ký làm merchant');
        return this.prisma.store.create({
            data: {
                merchantId: merchant.id,
                name: dto.name,
                description: dto.description,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng,
                openTime: dto.openTime,
                closeTime: dto.closeTime,
                coverImage: dto.coverImage,
            },
        });
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.store.findMany({
                skip,
                take: limit,
                where: { status: 'active' },
                select: {
                    id: true, name: true, address: true, lat: true, lng: true,
                    openTime: true, closeTime: true, coverImage: true, status: true,
                    merchant: { select: { businessName: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.store.count({ where: { status: 'active' } }),
        ]);
        return { data, total, page, limit };
    }
    async findNearby(lat, lng, radiusKm = 5, limit = 20) {
        const stores = await this.prisma.store.findMany({
            where: { status: 'active' },
            select: {
                id: true,
                name: true,
                address: true,
                lat: true,
                lng: true,
                openTime: true,
                closeTime: true,
                coverImage: true,
                status: true,
                merchant: { select: { businessName: true } },
            },
        });
        const storesWithDistance = stores
            .map((store) => ({
            ...store,
            distance: (0, haversine_util_1.haversineDistance)(lat, lng, store.lat, store.lng),
        }))
            .filter((store) => store.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        return {
            data: storesWithDistance,
            total: storesWithDistance.length,
            centerLat: lat,
            centerLng: lng,
            radiusKm,
        };
    }
    async findOne(id) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: {
                merchant: { select: { businessName: true } },
                images: true,
                menus: true,
                narrations: { include: { language: true } },
            },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        return store;
    }
    async update(id, userId, dto) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (store.merchant.userId !== userId)
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa store này');
        return this.prisma.store.update({ where: { id }, data: dto });
    }
    async remove(id, userId) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (store.merchant.userId !== userId)
            throw new common_1.ForbiddenException('Bạn không có quyền xóa store này');
        await this.prisma.store.delete({ where: { id } });
        return { success: true, message: 'Đã xóa store' };
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoresService);
//# sourceMappingURL=stores.service.js.map