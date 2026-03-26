import { PrismaService } from '../../database/prisma.service';
export declare class LanguagesService {
    private prisma;
    constructor(prisma: PrismaService);
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
