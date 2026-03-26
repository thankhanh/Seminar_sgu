import { PrismaService } from '../../database/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAllMerchants(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            stores: {
                id: string;
                name: string;
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
    toggleUserActive(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        email: string;
    }>;
}
