import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    private verifyStoreOwner;
    create(storeId: string, user: {
        id: string;
        role: string;
    }, dto: CreateMenuDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        imageUrl: string | null;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }>;
    findByStore(storeId: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        imageUrl: string | null;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }[]>;
    update(id: string, user: {
        id: string;
        role: string;
    }, dto: UpdateMenuDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        imageUrl: string | null;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
