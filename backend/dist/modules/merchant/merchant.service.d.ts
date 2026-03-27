import { PrismaService } from '../../database/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
export declare class MerchantService {
    private prisma;
    constructor(prisma: PrismaService);
    register(userId: string, dto: RegisterMerchantDto): Promise<{
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        taxCode: string | null;
        id: string;
        createdAt: Date;
        rejectReason: string | null;
        userId: string;
    }>;
    getMyMerchant(userId: string): Promise<{
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
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            status: import(".prisma/client").$Enums.MerchantStatus;
            businessName: string;
            taxCode: string | null;
            id: string;
            createdAt: Date;
            rejectReason: string | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    approveMerchant(id: string): Promise<{
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        taxCode: string | null;
        id: string;
        createdAt: Date;
        rejectReason: string | null;
        userId: string;
    }>;
    rejectMerchant(id: string, reason?: string): Promise<{
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        taxCode: string | null;
        id: string;
        createdAt: Date;
        rejectReason: string | null;
        userId: string;
    }>;
}
