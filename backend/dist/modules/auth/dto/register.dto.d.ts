export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'merchant';
    preferredLanguage?: string;
}
