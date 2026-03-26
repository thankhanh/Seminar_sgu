import { MerchantService } from './merchant.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
export declare class MerchantController {
    private readonly merchantService;
    constructor(merchantService: MerchantService);
    register(user: {
        id: string;
    }, dto: RegisterMerchantDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        userId: string;
        businessName: string;
        taxCode: string | null;
        rejectReason: string | null;
    }>;
    getMyMerchant(user: {
        id: string;
    }): Promise<{
        stores: {
            id: string;
            name: string;
            address: string;
            status: import(".prisma/client").$Enums.StoreStatus;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        userId: string;
        businessName: string;
        taxCode: string | null;
        rejectReason: string | null;
    }>;
}
