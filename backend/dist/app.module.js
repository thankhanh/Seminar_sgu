"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const env_config_1 = require("./config/env.config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const stores_module_1 = require("./modules/stores/stores.module");
const narrations_module_1 = require("./modules/narrations/narrations.module");
const menus_module_1 = require("./modules/menus/menus.module");
const payments_module_1 = require("./modules/payments/payments.module");
const merchant_module_1 = require("./modules/merchant/merchant.module");
const admin_module_1 = require("./modules/admin/admin.module");
const languages_module_1 = require("./modules/languages/languages.module");
const qr_module_1 = require("./modules/qr/qr.module");
const merchant_subscriptions_module_1 = require("./modules/merchant-subscriptions/merchant-subscriptions.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [database_config_1.default, jwt_config_1.default, env_config_1.default],
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 60,
                }]),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            stores_module_1.StoresModule,
            narrations_module_1.NarrationsModule,
            menus_module_1.MenusModule,
            payments_module_1.PaymentsModule,
            merchant_module_1.MerchantModule,
            admin_module_1.AdminModule,
            languages_module_1.LanguagesModule,
            qr_module_1.QrModule,
            merchant_subscriptions_module_1.MerchantSubscriptionsModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map