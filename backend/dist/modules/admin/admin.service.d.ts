import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        data: {
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAllMerchants(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                name: string;
                email: string;
                phone: string;
                id: string;
            };
            stores: {
                status: import(".prisma/client").$Enums.StoreStatus;
                name: string;
                id: string;
            }[];
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
    toggleUserActive(id: string): Promise<{
        name: string;
        email: string;
        id: string;
        isActive: boolean;
    }>;
    getStats(): Promise<{
        userCount: number;
        merchantCount: number;
        storeCount: number;
        transactionCount: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
