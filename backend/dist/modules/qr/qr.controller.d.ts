import { QrService } from './qr.service';
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    scanQr(code: string, user: {
        id: string;
    }): Promise<{
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
    getStoreQrCodes(storeId: string, user: {
        id: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        storeId: string;
        code: string;
        qrImageUrl: string | null;
    }[]>;
}
