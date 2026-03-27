import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private setCookies;
    private clearCookies;
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string;
            email: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            preferredLanguage: string;
            id: string;
            avatarUrl: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refresh(dto: RefreshTokenDto, req: Request, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(user: {
        id: string;
        email: string;
        role: string;
    }): {
        user: {
            id: string;
            email: string;
            role: string;
        };
    };
}
