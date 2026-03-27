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
    async create(user, dto) {
        let merchantId;
        if (user.role === 'admin') {
            if (!dto.merchantId) {
                throw new common_1.ForbiddenException('Admin phải cung cấp merchantId để tạo store');
            }
            merchantId = dto.merchantId;
        }
        else {
            const merchant = await this.prisma.merchant.findUnique({ where: { userId: user.id } });
            if (!merchant)
                throw new common_1.ForbiddenException('Bạn chưa đăng ký làm merchant');
            merchantId = merchant.id;
        }
        const [currentCount, activeSub] = await Promise.all([
            this.prisma.store.count({ where: { merchantId } }),
            this.prisma.merchantSubscription.findFirst({
                where: { merchantId, status: 'active' },
            }),
        ]);
        const maxStore = activeSub ? activeSub.maxStore : 1;
        if (currentCount >= maxStore) {
            throw new common_1.ForbiddenException(`Bạn đã đạt giới hạn tối đa ${maxStore} cửa hàng cho gói hiện tại. Vui lòng nâng cấp gói dịch vụ để thêm mới.`);
        }
        return this.prisma.store.create({
            data: {
                merchantId,
                name: dto.name,
                description: dto.description,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng,
                openTime: dto.openTime,
                closeTime: dto.closeTime,
                coverImage: dto.coverImage,
                status: (user.role === 'admin' ? dto.status : 'pending'),
                images: dto.images ? {
                    createMany: {
                        data: dto.images.map((url, index) => ({
                            imageUrl: url,
                            sortOrder: index,
                        })),
                    },
                } : undefined,
            },
        });
    }
    async findAll(page = 1, limit = 20, status, merchantId) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status === 'all') {
        }
        else if (status) {
            where.status = status;
        }
        else {
            where.status = 'active';
        }
        if (merchantId) {
            where.merchantId = merchantId;
        }
        const [data, total] = await Promise.all([
            this.prisma.store.findMany({
                skip,
                take: limit,
                where,
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
                    _count: {
                        select: { menus: true, narrations: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.store.count({ where }),
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
        const nearbyStores = stores
            .map(store => ({
            ...store,
            distance: (0, haversine_util_1.haversineDistance)(lat, lng, store.lat, store.lng),
        }))
            .filter(store => store.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        return { data: nearbyStores, userLat: lat, userLng: lng, radiusKm, total: nearbyStores.length };
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
    async update(id, user, dto) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (user.role !== 'admin' && store.merchant.userId !== user.id) {
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa store này');
        }
        const { merchantId, images, ...updateData } = dto;
        if (user.role !== 'admin') {
            delete updateData.status;
        }
        const updatedStore = await this.prisma.store.update({
            where: { id },
            data: {
                ...updateData,
                status: updateData.status ? updateData.status : undefined,
                images: images ? {
                    deleteMany: {},
                    createMany: {
                        data: images.map((url, index) => ({
                            imageUrl: url,
                            sortOrder: index,
                        })),
                    },
                } : undefined,
            }
        });
        return updatedStore;
    }
    async remove(id, user) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (user.role !== 'admin' && store.merchant.userId !== user.id) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa store này');
        }
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