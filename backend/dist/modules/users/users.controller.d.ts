import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
    }): Promise<{
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
    updateProfile(user: {
        id: string;
    }, dto: UpdateProfileDto): Promise<{
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
