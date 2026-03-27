import { NarrationsService } from './narrations.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { TranslateNarrationDto } from './dto/translate-narration.dto';
export declare class NarrationsController {
    private readonly narrService;
    constructor(narrService: NarrationsService);
    create(storeId: string, user: {
        id: string;
        role: string;
    }, dto: CreateNarrationDto): Promise<{
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
    }>;
    findByStore(storeId: string): Promise<({
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
    })[]>;
    findAll(page?: number, limit?: number, merchantId?: string): Promise<{
        data: ({
            language: {
                id: string;
                name: string;
                isActive: boolean;
                code: string;
                flagIcon: string | null;
            };
            store: {
                name: string;
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
        total: number;
        page: number;
        limit: number;
    }>;
    findNearby(lat: number, lng: number, language?: string, radius?: number, limit?: number): Promise<{
        data: {
            distance: number;
            language: {
                id: string;
                name: string;
                isActive: boolean;
                code: string;
                flagIcon: string | null;
            };
            store: {
                name: string;
                address: string;
            };
            id: string;
            isActive: boolean;
            createdAt: Date;
            storeId: string;
            languageId: string;
            audioUrl: string | null;
            textContent: string | null;
            duration: number | null;
        }[];
        userLat: number;
        userLng: number;
        languageCode: string;
        radiusKm: number;
    }>;
    recordListen(narrationId: string, user: {
        id: string;
    }, source?: 'gps' | 'qr'): Promise<{
        id: string;
        userId: string;
        storeId: string;
        source: import(".prisma/client").$Enums.ListenSource;
        listenedAt: Date;
        narrationId: string;
    }>;
    translateNarration(id: string, dto: TranslateNarrationDto): Promise<{
        originalText: string;
        translatedText: string;
        sourceLanguage: {
            code: string;
            name: string;
        };
        targetLanguage: {
            code: string;
            name: string;
        };
        saved: boolean;
        savedNarration: any;
    }>;
    update(id: string, user: {
        id: string;
        role: string;
    }, dto: UpdateNarrationDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        storeId: string;
        languageId: string;
        audioUrl: string | null;
        textContent: string | null;
        duration: number | null;
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
