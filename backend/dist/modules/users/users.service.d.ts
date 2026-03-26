import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        preferredLanguage: string;
        avatarUrl: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        preferredLanguage: string;
        avatarUrl: string;
    }>;
}
