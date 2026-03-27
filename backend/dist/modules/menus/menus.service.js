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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let MenusService = class MenusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyStoreOwner(storeId, user) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            include: { merchant: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        if (user.role !== 'admin' && store.merchant.userId !== user.id) {
            throw new common_1.ForbiddenException('Bạn không có quyền quản lý store này');
        }
        return store;
    }
    async create(storeId, user, dto) {
        await this.verifyStoreOwner(storeId, user);
        return this.prisma.menu.create({
            data: {
                storeId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                imageUrl: dto.imageUrl,
                isAvailable: dto.isAvailable ?? true,
            },
        });
    }
    async findByStore(storeId) {
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        return this.prisma.menu.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, user, dto) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu item không tồn tại');
        await this.verifyStoreOwner(menu.storeId, user);
        return this.prisma.menu.update({ where: { id }, data: dto });
    }
    async remove(id, user) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu item không tồn tại');
        await this.verifyStoreOwner(menu.storeId, user);
        await this.prisma.menu.delete({ where: { id } });
        return { success: true, message: 'Đã xóa menu item' };
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map