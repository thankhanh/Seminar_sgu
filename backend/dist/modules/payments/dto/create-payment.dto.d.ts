export declare enum PaymentMethodEnum {
    VNPAY = "vnpay",
    MOMO = "momo"
}
export declare enum SubscriptionTypeEnum {
    USER_MONTHLY = "user_monthly",
    USER_YEARLY = "user_yearly",
    MERCHANT_STARTER = "merchant_starter",
    MERCHANT_BUSINESS = "merchant_business",
    MERCHANT_PREMIUM = "merchant_premium"
}
export declare class CreatePaymentDto {
    method: PaymentMethodEnum;
    type: SubscriptionTypeEnum;
    ipAddr?: string;
}
