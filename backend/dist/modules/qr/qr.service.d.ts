import { PrismaService } from '../../database/prisma.service';
export declare class QrService {
    private prisma;
    constructor(prisma: PrismaService);
    generateQr(storeId: string, userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        storeId: string;
        code: string;
        qrImageUrl: string | null;
    }>;
    resolveQr(code: string): Promise<{
        store: {
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
        };
    }>;
    getStoreQrCodes(storeId: string, userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        storeId: string;
        code: string;
        qrImageUrl: string | null;
    }[]>;
    scanQr(code: string, userId: string): Promise<{
        store: {
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
        };
        listened: boolean;
    }>;
}
