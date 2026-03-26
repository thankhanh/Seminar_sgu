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
        return this.narrService.create(storeId, user.id, dto);
    }
    findByStore(storeId) {
        return this.narrService.findByStore(storeId);
    }
    translateNarration(id, dto) {
        return this.narrService.translateNarration(id, dto);
    }
    update(id, user, dto) {
        return this.narrService.update(id, user.id, dto);
    }
    remove(id, user) {
        return this.narrService.remove(id, user.id);
    }
};
exports.NarrationsController = NarrationsController;
__decorate([
    (0, common_1.Post)('stores/:storeId/narrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo narration cho store (merchant owner)' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật narration (merchant owner)' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Xóa narration (merchant owner)' }),
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