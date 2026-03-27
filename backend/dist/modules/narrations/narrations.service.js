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
exports.NarrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const translation_service_1 = require("../../common/services/translation.service");
let NarrationsService = class NarrationsService {
    constructor(prisma, translationService) {
        this.prisma = prisma;
        this.translationService = translationService;
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
        const existing = await this.prisma.narration.findUnique({
            where: { storeId_languageId: { storeId, languageId: dto.languageId } },
        });
        if (existing)
            throw new common_1.ConflictException('Narration cho ngôn ngữ này đã tồn tại');
        return this.prisma.narration.create({
            data: {
                storeId,
                languageId: dto.languageId,
                audioUrl: dto.audioUrl,
                textContent: dto.textContent,
                duration: dto.duration,
                isActive: dto.isActive ?? true,
            },
            include: { language: true },
        });
    }
    async findByStore(storeId) {
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
        if (!store)
            throw new common_1.NotFoundException('Store không tồn tại');
        return this.prisma.narration.findMany({
            where: { storeId, isActive: true },
            include: { language: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll(page = 1, limit = 20, merchantId) {
        const skip = (page - 1) * limit;
        const where = {};
        if (merchantId) {
            where.store = { merchantId };
        }
        const [data, total] = await Promise.all([
            this.prisma.narration.findMany({
                skip,
                take: limit,
                where,
                include: {
                    language: true,
                    store: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.narration.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async update(id, user, dto) {
        const narration = await this.prisma.narration.findUnique({ where: { id } });
        if (!narration)
            throw new common_1.NotFoundException('Narration không tồn tại');
        await this.verifyStoreOwner(narration.storeId, user);
        return this.prisma.narration.update({ where: { id }, data: dto });
    }
    async remove(id, user) {
        const narration = await this.prisma.narration.findUnique({ where: { id } });
        if (!narration)
            throw new common_1.NotFoundException('Narration không tồn tại');
        await this.verifyStoreOwner(narration.storeId, user);
        await this.prisma.narration.delete({ where: { id } });
        return { success: true, message: 'Đã xóa narration' };
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async findNearbyNarrations(lat, lng, languageCode = 'vi', radiusKm = 1, limit = 10) {
        const stores = await this.prisma.store.findMany({
            where: { status: 'active' },
            select: { id: true, name: true, lat: true, lng: true },
        });
        const nearbyStores = stores
            .map(store => ({
            ...store,
            distance: this.calculateDistance(lat, lng, store.lat, store.lng),
        }))
            .filter(store => store.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        const storeIds = nearbyStores.map(s => s.id);
        const narrations = await this.prisma.narration.findMany({
            where: {
                storeId: { in: storeIds },
                isActive: true,
                language: { code: languageCode },
            },
            include: {
                store: { select: { name: true, address: true } },
                language: true,
            },
        });
        const result = narrations.map(narration => {
            const store = nearbyStores.find(s => s.id === narration.storeId);
            return {
                ...narration,
                distance: store?.distance || 0,
            };
        }).sort((a, b) => a.distance - b.distance);
        return { data: result, userLat: lat, userLng: lng, languageCode, radiusKm };
    }
    async recordListen(userId, narrationId, source = 'gps') {
        const narration = await this.prisma.narration.findUnique({
            where: { id: narrationId },
            include: { store: true },
        });
        if (!narration)
            throw new common_1.NotFoundException('Narration không tồn tại');
        return this.prisma.listenHistory.create({
            data: {
                userId,
                storeId: narration.storeId,
                narrationId,
                source,
            },
        });
    }
    async translateNarration(narrationId, dto) {
        const narration = await this.prisma.narration.findUnique({
            where: { id: narrationId },
            include: { language: true },
        });
        if (!narration)
            throw new common_1.NotFoundException('Narration không tồn tại');
        if (!narration.textContent || narration.textContent.trim().length === 0) {
            throw new common_1.BadRequestException('Narration này không có nội dung text để dịch');
        }
        const targetLanguage = await this.prisma.language.findFirst({
            where: { code: dto.targetLanguageCode, isActive: true },
        });
        if (!targetLanguage) {
            throw new common_1.NotFoundException(`Ngôn ngữ "${dto.targetLanguageCode}" không tồn tại hoặc chưa được kích hoạt`);
        }
        const sourceLanguageCode = narration.language.code;
        const result = await this.translationService.translate(narration.textContent, sourceLanguageCode, dto.targetLanguageCode);
        let savedNarration = null;
        if (dto.saveAsNew) {
            const existing = await this.prisma.narration.findUnique({
                where: {
                    storeId_languageId: {
                        storeId: narration.storeId,
                        languageId: targetLanguage.id,
                    },
                },
            });
            if (existing) {
                savedNarration = await this.prisma.narration.update({
                    where: { id: existing.id },
                    data: { textContent: result.translatedText },
                    include: { language: true },
                });
            }
            else {
                savedNarration = await this.prisma.narration.create({
                    data: {
                        storeId: narration.storeId,
                        languageId: targetLanguage.id,
                        textContent: result.translatedText,
                        duration: narration.duration,
                        isActive: true,
                    },
                    include: { language: true },
                });
            }
        }
        return {
            originalText: narration.textContent,
            translatedText: result.translatedText,
            sourceLanguage: {
                code: sourceLanguageCode,
                name: narration.language.name,
            },
            targetLanguage: {
                code: dto.targetLanguageCode,
                name: targetLanguage.name,
            },
            saved: dto.saveAsNew ?? false,
            savedNarration,
        };
    }
};
exports.NarrationsService = NarrationsService;
exports.NarrationsService = NarrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        translation_service_1.TranslationService])
], NarrationsService);
//# sourceMappingURL=narrations.service.js.map