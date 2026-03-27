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
