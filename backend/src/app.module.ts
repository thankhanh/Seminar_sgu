import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Config
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/env.config';

// Core
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { NarrationsModule } from './modules/narrations/narrations.module';
import { MenusModule } from './modules/menus/menus.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { AdminModule } from './modules/admin/admin.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { QrModule } from './modules/qr/qr.module';
import { MerchantSubscriptionsModule } from './modules/merchant-subscriptions/merchant-subscriptions.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlanMetadataModule } from './modules/plan-metadata/plan-metadata.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // Cấu hình môi trường — load .env + các config namespace
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig, appConfig],
    }),

    // Rate Limiting — chống brute force
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 phút
      limit: 60,  // 60 request / phút mặc định (auth routes override riêng)
    }]),

    // Database (Prisma - Global)
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    StoresModule,
    NarrationsModule,
    MenusModule,
    PaymentsModule,
    MerchantModule,
    AdminModule,
    LanguagesModule,
    QrModule,
    MerchantSubscriptionsModule,
    SubscriptionsModule,
    UploadModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    // Áp dụng ThrottlerGuard cho toàn bộ app
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
