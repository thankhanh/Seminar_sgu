import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    private verifyStoreOwner;
    create(storeId: string, userId: string, dto: CreateMenuDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        storeId: string;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }>;
    findByStore(storeId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        storeId: string;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }[]>;
    update(id: string, userId: string, dto: UpdateMenuDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        storeId: string;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
