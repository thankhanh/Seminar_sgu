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
exports.CreatePaymentDto = exports.SubscriptionTypeEnum = exports.PaymentMethodEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PaymentMethodEnum;
(function (PaymentMethodEnum) {
    PaymentMethodEnum["VNPAY"] = "vnpay";
    PaymentMethodEnum["MOMO"] = "momo";
})(PaymentMethodEnum || (exports.PaymentMethodEnum = PaymentMethodEnum = {}));
var SubscriptionTypeEnum;
(function (SubscriptionTypeEnum) {
    SubscriptionTypeEnum["USER_MONTHLY"] = "user_monthly";
    SubscriptionTypeEnum["USER_YEARLY"] = "user_yearly";
    SubscriptionTypeEnum["MERCHANT_STARTER"] = "merchant_starter";
    SubscriptionTypeEnum["MERCHANT_BUSINESS"] = "merchant_business";
    SubscriptionTypeEnum["MERCHANT_PREMIUM"] = "merchant_premium";
})(SubscriptionTypeEnum || (exports.SubscriptionTypeEnum = SubscriptionTypeEnum = {}));
class CreatePaymentDto {
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethodEnum, example: PaymentMethodEnum.VNPAY }),
    (0, class_validator_1.IsEnum)(PaymentMethodEnum),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SubscriptionTypeEnum, example: SubscriptionTypeEnum.USER_MONTHLY }),
    (0, class_validator_1.IsEnum)(SubscriptionTypeEnum),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '127.0.0.1', description: 'IP người dùng (dùng cho VNPay)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "ipAddr", void 0);
//# sourceMappingURL=create-payment.dto.js.map