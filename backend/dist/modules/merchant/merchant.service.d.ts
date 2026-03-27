import { PrismaService } from '../../database/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { MerchantSubscriptionsService } from '../merchant-subscriptions/merchant-subscriptions.service';
export declare class MerchantService {
    private prisma;
    private merchantSubscriptionsService;
    constructor(prisma: PrismaService, merchantSubscriptionsService: MerchantSubscriptionsService);
    register(userId: string, dto: RegisterMerchantDto): Promise<{
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
    getMyMerchant(userId: string): Promise<{
        merchantSubscriptions: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            merchantId: string;
            plan: import(".prisma/client").$Enums.MerchantPlan;
            maxStore: number;
            maxPOI: number;
            startDate: Date;
            endDate: Date;
        }[];
        stores: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StoreStatus;
            description: string | null;
            merchantId: string;
            address: string;
            lat: number;
            lng: number;
            openTime: string | null;
            closeTime: string | null;
            coverImage: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            businessName: string;
            taxCode: string | null;
            status: import(".prisma/client").$Enums.MerchantStatus;
            rejectReason: string | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    approveMerchant(id: string): Promise<{
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
    rejectMerchant(id: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
}
