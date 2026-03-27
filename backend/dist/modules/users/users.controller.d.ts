import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
    }): Promise<{
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
    updateProfile(user: {
        id: string;
    }, dto: UpdateProfileDto): Promise<{
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
