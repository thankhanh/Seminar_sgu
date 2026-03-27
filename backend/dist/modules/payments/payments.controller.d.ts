import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(user: {
        id: string;
    }, dto: CreatePaymentDto, req: Request): Promise<{
        paymentUrl: string;
        transactionId: string;
        orderId: string;
    } | {
        paymentUrl: any;
        deeplink: any;
        qrCodeUrl: any;
        transactionId: string;
        orderId: string;
    }>;
    vnpayReturn(query: Record<string, string>): Promise<{
        success: boolean;
        responseCode: string;
        transactionId: string;
    }>;
    vnpayIpn(query: Record<string, string>): Promise<{
        RspCode: string;
        Message: string;
    }>;
    momoIpn(body: Record<string, any>): Promise<{
        message: string;
    }>;
    momoReturn(query: Record<string, string>): {
        message: string;
        query: Record<string, string>;
    };
    getHistory(user: {
        id: string;
    }): Promise<({
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
        momoDetail: {
            message: string | null;
            id: string;
            createdAt: Date;
            amount: bigint;
            orderInfo: string | null;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            transactionId: string;
            orderId: string;
            requestId: string | null;
            momoTransId: string | null;
            resultCode: number | null;
            payType: string | null;
            signature: string | null;
        };
    } & {
        status: import(".prisma/client").$Enums.TransactionStatus;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentRefId: string | null;
    })[]>;
}
