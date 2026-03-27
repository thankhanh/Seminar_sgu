import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(storeId: string, user: {
        id: string;
        role: string;
    }, dto: CreateMenuDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        imageUrl: string | null;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }>;
    findByStore(storeId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        imageUrl: string | null;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isAvailable: boolean;
    }[]>;
    update(id: string, user: {
        id: string;
        role: string;
    }, dto: UpdateMenuDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
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
