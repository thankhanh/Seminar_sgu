"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3001',
        ],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Vĩnh Khánh Audio Guide API')
        .setDescription(`REST API cho hệ thống thuyết minh ẩm thực đa ngôn ngữ theo vị trí GPS.\n\n` +
        `**Base URL:** \`/api/v1\`\n` +
        `**Auth:** Bearer JWT Token`)
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .addTag('Auth', 'Đăng ký, đăng nhập, refresh token')
        .addTag('Users', 'Quản lý hồ sơ người dùng')
        .addTag('Stores', 'Tìm kiếm và xem thông tin quán')
        .addTag('Narrations', 'Thuyết minh audio đa ngôn ngữ')
        .addTag('Menus', 'Món ăn trong quán')
        .addTag('Languages', 'Ngôn ngữ hỗ trợ')
        .addTag('QR', 'Mã QR tại quán')
        .addTag('Merchant', 'Dashboard chủ quán')
        .addTag('Admin', 'Quản trị hệ thống')
        .addTag('Payments', 'Thanh toán VNPAY & MoMo')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║   🍜 Vĩnh Khánh Audio Guide — Backend API   ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  🚀 Server  : http://localhost:${port}         ║`);
    console.log(`║  📖 Swagger : http://localhost:${port}/api     ║`);
    console.log(`║  🌍 Env     : ${process.env.NODE_ENV ?? 'development'}              ║`);
    console.log('╚══════════════════════════════════════════════╝\n');
}
bootstrap();
//# sourceMappingURL=main.js.map