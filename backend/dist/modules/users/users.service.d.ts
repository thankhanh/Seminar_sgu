import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        preferredLanguage: string;
        id: string;
        avatarUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        preferredLanguage: string;
        id: string;
        avatarUrl: string;
        updatedAt: Date;
    }>;
}
