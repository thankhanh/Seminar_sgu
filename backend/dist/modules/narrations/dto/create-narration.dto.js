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
exports.CreateNarrationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateNarrationDto {
}
exports.CreateNarrationDto = CreateNarrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'lang-id-here' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNarrationDto.prototype, "languageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://...audio.mp3' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNarrationDto.prototype, "audioUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Đây là nội dung thuyết minh...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNarrationDto.prototype, "textContent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 120, description: 'Thời lượng tính bằng giây' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateNarrationDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNarrationDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-narration.dto.js.map