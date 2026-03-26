import { PrismaService } from '../../database/prisma.service';
import { TranslationService } from '../../common/services/translation.service';
import { CreateNarrationDto } from './dto/create-narration.dto';
import { UpdateNarrationDto } from './dto/update-narration.dto';
import { TranslateNarrationDto } from './dto/translate-narration.dto';
export declare class NarrationsService {
    private prisma;
    private translationService;
    constructor(prisma: PrismaService, translationService: TranslationService);
    private verifyStoreOwner;
    create(storeId: string, userId: string, dto: CreateNarrationDto): Promise<{
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
    update(id: string, userId: string, dto: UpdateNarrationDto): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        languageId: string;
        audioUrl: string | null;
        textContent: string | null;
        duration: number | null;
        isActive: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    translateNarration(narrationId: string, dto: TranslateNarrationDto): Promise<{
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
}
