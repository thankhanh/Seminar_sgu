import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
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
        vnpayDetail: {
            id: string;
            createdAt: Date;
            transactionId: string;
            vnpTxnRef: string;
            vnpAmount: bigint;
            vnpOrderInfo: string | null;
            vnpTransactionNo: string | null;
            vnpBankCode: string | null;
            vnpPayDate: string | null;
            vnpResponseCode: string | null;
            vnpSecureHash: string | null;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
        };
        momoDetail: {
            id: string;
            amount: bigint;
            createdAt: Date;
            transactionId: string;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            orderId: string;
            requestId: string | null;
            orderInfo: string | null;
            momoTransId: string | null;
            resultCode: number | null;
            message: string | null;
            payType: string | null;
            signature: string | null;
        };
    } & {
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        type: import(".prisma/client").$Enums.TransactionType;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentRefId: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    private formatDate;
    private postRequest;
}
