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
exports.LanguagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const languages_service_1 = require("./languages.service");
let LanguagesController = class LanguagesController {
    constructor(languagesService) {
        this.languagesService = languagesService;
    }
    findAll() {
        return this.languagesService.findAll();
    }
    findOne(id) {
        return this.languagesService.findOne(id);
    }
    findByCode(code) {
        return this.languagesService.findByCode(code);
    }
};
exports.LanguagesController = LanguagesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách ngôn ngữ hỗ trợ (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LanguagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết ngôn ngữ theo ID (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LanguagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Tìm ngôn ngữ theo code (vd: vi, en, ja)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LanguagesController.prototype, "findByCode", null);
exports.LanguagesController = LanguagesController = __decorate([
    (0, swagger_1.ApiTags)('Languages'),
    (0, common_1.Controller)('languages'),
    __metadata("design:paramtypes", [languages_service_1.LanguagesService])
], LanguagesController);
//# sourceMappingURL=languages.controller.js.map