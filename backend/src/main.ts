import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình để serve file tĩnh từ thư mục 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix — tất cả route bắt đầu bằng /api/v1
  app.setGlobalPrefix('api/v1');

  // Khai báo middleware cookie-parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', // Web Dashboard
      'http://localhost:3001', // Dev alt port
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global Exception Filter — format lỗi chuẩn
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Response Interceptor — wrap response { success, data }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Validation Pipe — validate DTO tự động
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
      transform: true,            // Auto-transform type (string → number, etc.)
    }),
  );

  // Swagger / OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Vĩnh Khánh Audio Guide API')
    .setDescription(
      `REST API cho hệ thống thuyết minh ẩm thực đa ngôn ngữ theo vị trí GPS.\n\n` +
      `**Base URL:** \`/api/v1\`\n` +
      `**Auth:** Bearer JWT Token`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
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
