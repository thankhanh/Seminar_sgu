import { NarrationsService } from './narrations.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { TranslateNarrationDto } from './dto/translate-narration.dto';
export declare class NarrationsController {
    private readonly narrService;
    constructor(narrService: NarrationsService);
    create(storeId: string, user: {
        id: string;
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
        createdAt: Date;
        storeId: string;
        languageId: string;
        audioUrl: string | null;
        textContent: string | null;
        duration: number | null;
        isActive: boolean;
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
        createdAt: Date;
        storeId: string;
        languageId: string;
        audioUrl: string | null;
        textContent: string | null;
        duration: number | null;
        isActive: boolean;
    })[]>;
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
    }, dto: UpdateNarrationDto): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        languageId: string;
        audioUrl: string | null;
        textContent: string | null;
        duration: number | null;
        isActive: boolean;
    }>;
    remove(id: string, user: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
