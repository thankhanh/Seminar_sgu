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
exports.CreateStoreDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateStoreDto {
}
exports.CreateStoreDto = CreateStoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Quán Cà Phê Vĩnh Khánh' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Quán cà phê view đẹp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Đường ABC, Quận 1, TP.HCM' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.7769 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 106.7009 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '08:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '22:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "closeTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "coverImage", void 0);
//# sourceMappingURL=create-store.dto.js.map