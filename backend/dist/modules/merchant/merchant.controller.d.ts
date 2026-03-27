import { MerchantService } from './merchant.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
export declare class MerchantController {
    private readonly merchantService;
    constructor(merchantService: MerchantService);
    register(user: {
        id: string;
    }, dto: RegisterMerchantDto): Promise<{
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        taxCode: string | null;
        id: string;
        createdAt: Date;
        rejectReason: string | null;
        userId: string;
    }>;
    getMyMerchant(user: {
        id: string;
    }): Promise<{
        stores: {
            status: import(".prisma/client").$Enums.StoreStatus;
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            openTime: string | null;
            closeTime: string | null;
            coverImage: string | null;
            merchantId: string;
        }[];
    } & {
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        taxCode: string | null;
        id: string;
        createdAt: Date;
        rejectReason: string | null;
        userId: string;
    }>;
}
