import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateStoreDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            address: string;
            lat: number;
            lng: number;
            openTime: string;
            closeTime: string;
            coverImage: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            merchant: {
                businessName: string;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findNearby(lat: number, lng: number, radiusKm?: number, limit?: number): Promise<{
        data: {
            distance: number;
            id: string;
            name: string;
            address: string;
            lat: number;
            lng: number;
            openTime: string;
            closeTime: string;
            coverImage: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            merchant: {
                businessName: string;
            };
        }[];
        total: number;
        centerLat: number;
        centerLng: number;
        radiusKm: number;
    }>;
    findOne(id: string): Promise<{
        merchant: {
            businessName: string;
        };
        images: {
            id: string;
            createdAt: Date;
            storeId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        menus: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            storeId: string;
            imageUrl: string | null;
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
            createdAt: Date;
            storeId: string;
            languageId: string;
            audioUrl: string | null;
            textContent: string | null;
            duration: number | null;
            isActive: boolean;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
    }>;
    update(id: string, userId: string, dto: UpdateStoreDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        address: string;
        lat: number;
        lng: number;
        openTime: string | null;
        closeTime: string | null;
        coverImage: string | null;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
