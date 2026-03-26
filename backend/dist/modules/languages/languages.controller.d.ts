import { LanguagesService } from './languages.service';
export declare class LanguagesController {
    private readonly languagesService;
    constructor(languagesService: LanguagesService);
    findAll(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            narrations: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }>;
    findByCode(code: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }>;
}
