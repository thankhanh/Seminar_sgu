import { AdminService } from './admin.service';
import { RejectMerchantDto } from './dto/reject-merchant.dto';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
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
                id: string;
                email: string;
                name: string;
                phone: string;
            };
            stores: {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.StoreStatus;
            }[];
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
    rejectMerchant(id: string, dto: RejectMerchantDto): Promise<{
        id: string;
        createdAt: Date;
        businessName: string;
        taxCode: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        rejectReason: string | null;
        userId: string;
    }>;
    toggleUserActive(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        isActive: boolean;
    }>;
    getStats(): Promise<{
        userCount: number;
        merchantCount: number;
        storeCount: number;
        transactionCount: number;
        totalRevenue: number;
        userGrowth: number;
        storeGrowth: number;
        transactionGrowth: number;
        revenueGrowth: number;
        monthlyRevenue: any[];
    }>;
}
