import { PrismaService } from '../../database/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
export declare class LanguagesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            narrations: number;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }>;
    findByCode(code: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }>;
    create(dto: CreateLanguageDto): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: Partial<CreateLanguageDto>): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__LanguageClient<{
        name: string;
        id: string;
        isActive: boolean;
        code: string;
        flagIcon: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
