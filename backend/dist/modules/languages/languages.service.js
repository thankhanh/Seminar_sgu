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
exports.LanguagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let LanguagesService = class LanguagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.language.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const language = await this.prisma.language.findUnique({
            where: { id },
            include: {
                _count: { select: { narrations: true } },
            },
        });
        if (!language)
            throw new common_1.NotFoundException('Ngôn ngữ không tồn tại');
        return language;
    }
    async findByCode(code) {
        const language = await this.prisma.language.findUnique({
            where: { code },
        });
        if (!language)
            throw new common_1.NotFoundException(`Ngôn ngữ "${code}" không tồn tại`);
        return language;
    }
    create(dto) {
        return this.prisma.language.create({
            data: dto,
        });
    }
    update(id, dto) {
        return this.prisma.language.update({
            where: { id },
            data: dto,
        });
    }
    remove(id) {
        return this.prisma.language.delete({
            where: { id },
        });
    }
};
exports.LanguagesService = LanguagesService;
exports.LanguagesService = LanguagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LanguagesService);
//# sourceMappingURL=languages.service.js.map