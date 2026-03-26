import { PrismaService } from '../../database/prisma.service';
export declare class QrService {
    private prisma;
    constructor(prisma: PrismaService);
    generateQr(storeId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        isActive: boolean;
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
        };
    }>;
    getStoreQrCodes(storeId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        isActive: boolean;
        code: string;
        qrImageUrl: string | null;
    }[]>;
}
