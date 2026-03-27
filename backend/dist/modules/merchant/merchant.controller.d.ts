import { MerchantService } from './merchant.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
export declare class MerchantController {
    private readonly merchantService;
    constructor(merchantService: MerchantService);
    register(user: {
        id: string;
    }, dto: RegisterMerchantDto): Promise<{
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
    getMyMerchant(user: {
        id: string;
    }): Promise<{
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
}
