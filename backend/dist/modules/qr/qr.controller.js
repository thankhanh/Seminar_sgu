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
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const qr_service_1 = require("./qr.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let QrController = class QrController {
    constructor(qrService) {
        this.qrService = qrService;
    }
    generateQr(storeId, user) {
        return this.qrService.generateQr(storeId, user.id);
    }
    resolveQr(code) {
        return this.qrService.resolveQr(code);
    }
    getStoreQrCodes(storeId, user) {
        return this.qrService.getStoreQrCodes(storeId, user.id);
    }
};
exports.QrController = QrController;
__decorate([
    (0, common_1.Post)('generate/:storeId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo QR code cho store (merchant owner)' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "generateQr", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve QR code → thông tin store (public)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "resolveQr", null);
__decorate([
    (0, common_1.Get)('store/:storeId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách QR codes của store (merchant owner)' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "getStoreQrCodes", null);
exports.QrController = QrController = __decorate([
    (0, swagger_1.ApiTags)('QR'),
    (0, common_1.Controller)('qr'),
    __metadata("design:paramtypes", [qr_service_1.QrService])
], QrController);
//# sourceMappingURL=qr.controller.js.map