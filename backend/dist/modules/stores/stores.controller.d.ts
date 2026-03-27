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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StoreStatus;
        description: string | null;
        merchantId: string;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
    }>;
    findAll(page?: number, limit?: number, status?: string, merchantId?: string): Promise<{
        data: {
            merchant: {
                businessName: string;
            };
            id: string;
            name: string;
            _count: {
                menus: number;
                narrations: number;
            };
            status: import(".prisma/client").$Enums.StoreStatus;
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
            merchant: {
                businessName: string;
            };
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.StoreStatus;
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
        menus: {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            storeId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            isAvailable: boolean;
        }[];
        narrations: ({
            language: {
                id: string;
                name: string;
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
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            sortOrder: number;
            storeId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StoreStatus;
        description: string | null;
        merchantId: string;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
    }>;
    update(id: string, user: {
        id: string;
        role: string;
    }, dto: UpdateStoreDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StoreStatus;
        description: string | null;
        merchantId: string;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
