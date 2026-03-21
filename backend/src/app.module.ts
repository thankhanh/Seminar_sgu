import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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


@Module({
  imports: [
    // Cấu hình môi trường — load .env + các config namespace
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig, appConfig],
    }),

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

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
