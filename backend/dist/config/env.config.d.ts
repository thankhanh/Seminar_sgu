declare const _default: (() => {
    port: number;
    env: string;
    vnpay: {
        tmnCode: string;
        hashSecret: string;
        url: string;
        returnUrl: string;
        ipnUrl: string;
    };
    momo: {
        partnerCode: string;
        accessKey: string;
        secretKey: string;
        endpoint: string;
        ipnUrl: string;
        redirectUrl: string;
    };
    aws: {
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    env: string;
    vnpay: {
        tmnCode: string;
        hashSecret: string;
        url: string;
        returnUrl: string;
        ipnUrl: string;
    };
    momo: {
        partnerCode: string;
        accessKey: string;
        secretKey: string;
        endpoint: string;
        ipnUrl: string;
        redirectUrl: string;
    };
    aws: {
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
}>;
export default _default;
