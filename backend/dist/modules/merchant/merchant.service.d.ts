import { PrismaService } from '../../database/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
export declare class MerchantService {
    private prisma;
    constructor(prisma: PrismaService);
    register(userId: string, dto: RegisterMerchantDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        userId: string;
        businessName: string;
        taxCode: string | null;
        rejectReason: string | null;
    }>;
    getMyMerchant(userId: string): Promise<{
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
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MerchantStatus;
            createdAt: Date;
            userId: string;
            businessName: string;
            taxCode: string | null;
            rejectReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    approveMerchant(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        userId: string;
        businessName: string;
        taxCode: string | null;
        rejectReason: string | null;
    }>;
    rejectMerchant(id: string, reason?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        userId: string;
        businessName: string;
        taxCode: string | null;
        rejectReason: string | null;
    }>;
}
