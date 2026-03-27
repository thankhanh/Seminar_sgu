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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const narrations_service_1 = require("./narrations.service");
const create_narration_dto_1 = require("./dto/create-narration.dto");
const update_narration_dto_1 = require("./dto/update-narration.dto");
const translate_narration_dto_1 = require("./dto/translate-narration.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let NarrationsController = class NarrationsController {
    constructor(narrService) {
        this.narrService = narrService;
    }
    create(storeId, user, dto) {
        return this.narrService.create(storeId, user, dto);
    }
    findByStore(storeId) {
        return this.narrService.findByStore(storeId);
    }
    findAll(page, limit, merchantId) {
        return this.narrService.findAll(Number(page) || 1, Number(limit) || 20, merchantId);
    }
    findNearby(lat, lng, language = 'vi', radius = 1, limit = 10) {
        return this.narrService.findNearbyNarrations(+lat, +lng, language, +radius, +limit);
    }
    recordListen(narrationId, user, source = 'gps') {
        return this.narrService.recordListen(user.id, narrationId, source);
    }
    translateNarration(id, dto) {
        return this.narrService.translateNarration(id, dto);
    }
    update(id, user, dto) {
        return this.narrService.update(id, user, dto);
    }
    remove(id, user) {
        return this.narrService.remove(id, user);
    }
};
exports.NarrationsController = NarrationsController;
__decorate([
    (0, common_1.Post)('stores/:storeId/narrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo narration cho store (merchant owner/admin)' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_narration_dto_1.CreateNarrationDto]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('stores/:storeId/narrations'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách narration của store (public)' }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "findByStore", null);
__decorate([
    (0, common_1.Get)('narrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách tất cả narration (Admin)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Tìm narrations gần nhất dựa trên vị trí (public)' }),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: true, type: Number, example: 10.7769 }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: true, type: Number, example: 106.7009 }),
    (0, swagger_1.ApiQuery)({ name: 'language', required: false, type: String, example: 'vi' }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, type: Number, example: 1, description: 'Bán kính tìm kiếm (km)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('radius')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Post)('listen/:narrationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Ghi nhận việc nghe narration (user)' }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, enum: ['gps', 'qr'], example: 'gps' }),
    __param(0, (0, common_1.Param)('narrationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "recordListen", null);
__decorate([
    (0, common_1.Post)('narrations/:id/translate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dịch nội dung thuyết minh sang ngôn ngữ khác',
        description: 'Nhận narration ID, dịch textContent từ ngôn ngữ gốc sang ngôn ngữ đích. ' +
            'Có thể tùy chọn lưu bản dịch thành narration mới.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, translate_narration_dto_1.TranslateNarrationDto]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "translateNarration", null);
__decorate([
    (0, common_1.Patch)('narrations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật narration (merchant owner/admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_narration_dto_1.UpdateNarrationDto]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('narrations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa narration (merchant owner/admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NarrationsController.prototype, "remove", null);
exports.NarrationsController = NarrationsController = __decorate([
    (0, swagger_1.ApiTags)('Narrations'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [narrations_service_1.NarrationsService])
], NarrationsController);
//# sourceMappingURL=narrations.controller.js.map