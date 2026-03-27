import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';
export declare class PaymentsService {
    private prisma;
    private config;
    private subscriptionService;
    constructor(prisma: PrismaService, config: ConfigService, subscriptionService: MerchantSubscriptionsService);
    createVnpayPayment(userId: string, dto: CreatePaymentDto, ipAddr: string): Promise<{
        paymentUrl: string;
        transactionId: string;
        orderId: string;
    }>;
    handleVnpayReturn(query: Record<string, string>): Promise<{
        success: boolean;
        responseCode: string;
        transactionId: string;
    }>;
    private handlePostPayment;
    handleVnpayIpn(query: Record<string, string>): Promise<{
        RspCode: string;
        Message: string;
    }>;
    createMomoPayment(userId: string, dto: CreatePaymentDto): Promise<{
        paymentUrl: any;
        deeplink: any;
        qrCodeUrl: any;
        transactionId: string;
        orderId: string;
    }>;
    handleMomoIpn(body: Record<string, any>): Promise<{
        message: string;
    }>;
    getTransactionHistory(userId: string): Promise<({
        momoDetail: {
            id: string;
            createdAt: Date;
            amount: bigint;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            transactionId: string;
            orderId: string;
            requestId: string | null;
            orderInfo: string | null;
            momoTransId: string | null;
            resultCode: number | null;
            message: string | null;
            payType: string | null;
            signature: string | null;
        };
        vnpayDetail: {
            id: string;
            createdAt: Date;
            vnpTxnRef: string;
            vnpAmount: bigint;
            vnpOrderInfo: string | null;
            vnpTransactionNo: string | null;
            vnpBankCode: string | null;
            vnpPayDate: string | null;
            vnpResponseCode: string | null;
            vnpSecureHash: string | null;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            transactionId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentRefId: string | null;
    })[]>;
    private formatDate;
    private postRequest;
}
