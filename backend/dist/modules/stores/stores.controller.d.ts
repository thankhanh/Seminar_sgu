import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    create(user: {
        id: string;
        role: string;
    }, dto: CreateStoreDto): Promise<{
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
    }>;
    findAll(page?: number, limit?: number, status?: string, merchantId?: string): Promise<{
        data: {
            status: import(".prisma/client").$Enums.StoreStatus;
            merchant: {
                businessName: string;
            };
            name: string;
            id: string;
            _count: {
                menus: number;
                narrations: number;
            };
            address: string;
            lat: number;
            lng: number;
            openTime: string;
            closeTime: string;
            coverImage: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findNearby(lat: number, lng: number, radius?: number, limit?: number): Promise<{
        data: {
            distance: number;
            status: import(".prisma/client").$Enums.StoreStatus;
            merchant: {
                businessName: string;
            };
            name: string;
            id: string;
            address: string;
            lat: number;
            lng: number;
            openTime: string;
            closeTime: string;
            coverImage: string;
        }[];
        userLat: number;
        userLng: number;
        radiusKm: number;
        total: number;
    }>;
    findOne(id: string): Promise<{
        merchant: {
            businessName: string;
        };
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            sortOrder: number;
            storeId: string;
        }[];
        menus: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            storeId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            isAvailable: boolean;
        }[];
        narrations: ({
            language: {
                name: string;
                id: string;
                isActive: boolean;
                code: string;
                flagIcon: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            storeId: string;
            languageId: string;
            audioUrl: string | null;
            textContent: string | null;
            duration: number | null;
        })[];
    } & {
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
    }>;
    update(id: string, user: {
        id: string;
        role: string;
    }, dto: UpdateStoreDto): Promise<{
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
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
