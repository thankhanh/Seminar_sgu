import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
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
    create(dto: CreateLanguageDto): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: Partial<CreateLanguageDto>): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
