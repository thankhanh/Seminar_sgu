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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async create(user, dto, req) {
        const ipAddr = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            '127.0.0.1';
        if (dto.method === create_payment_dto_1.PaymentMethodEnum.VNPAY) {
            return this.paymentsService.createVnpayPayment(user.id, dto, ipAddr);
        }
        return this.paymentsService.createMomoPayment(user.id, dto);
    }
    vnpayReturn(query) {
        return this.paymentsService.handleVnpayReturn(query);
    }
    vnpayIpn(query) {
        return this.paymentsService.handleVnpayIpn(query);
    }
    momoIpn(body) {
        return this.paymentsService.handleMomoIpn(body);
    }
    momoReturn(query) {
        return { message: 'Vui lòng kiểm tra kết quả từ IPN', query };
    }
    getHistory(user) {
        return this.paymentsService.getTransactionHistory(user.id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Tạo yêu cầu thanh toán (VNPay hoặc MoMo)',
        description: 'Trả về `paymentUrl` để redirect người dùng đến trang thanh toán.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vnpay/return'),
    (0, swagger_1.ApiOperation)({
        summary: 'VNPay Return URL — xử lý kết quả sau thanh toán',
        description: 'VNPay redirect người dùng về đây sau khi hoàn tất.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "vnpayReturn", null);
__decorate([
    (0, common_1.Post)('vnpay/ipn'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'VNPay IPN — nhận thông báo bất đồng bộ từ VNPay',
        description: 'VNPay server gọi endpoint này để xác nhận kết quả giao dịch.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "vnpayIpn", null);
__decorate([
    (0, common_1.Post)('momo/ipn'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'MoMo IPN — nhận thông báo bất đồng bộ từ MoMo',
        description: 'MoMo server gọi endpoint này để xác nhận kết quả giao dịch.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "momoIpn", null);
__decorate([
    (0, common_1.Get)('momo/return'),
    (0, swagger_1.ApiOperation)({
        summary: 'MoMo Return URL — xử lý kết quả trả về từ MoMo',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "momoReturn", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch sử giao dịch của người dùng' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getHistory", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map