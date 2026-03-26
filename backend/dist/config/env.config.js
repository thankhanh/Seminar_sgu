"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    vnpay: {
        tmnCode: process.env.VNPAY_TMN_CODE,
        hashSecret: process.env.VNPAY_HASH_SECRET,
        url: process.env.VNPAY_URL,
        returnUrl: process.env.VNPAY_RETURN_URL,
        ipnUrl: process.env.VNPAY_IPN_URL,
    },
    momo: {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        endpoint: process.env.MOMO_ENDPOINT,
        ipnUrl: process.env.MOMO_IPN_URL,
        redirectUrl: process.env.MOMO_REDIRECT_URL,
    },
    aws: {
        bucket: process.env.AWS_S3_BUCKET,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION ?? 'ap-southeast-1',
    },
}));
//# sourceMappingURL=env.config.js.map