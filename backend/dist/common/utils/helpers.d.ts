export declare function hashPassword(plain: string): Promise<string>;
export declare function comparePassword(plain: string, hash: string): Promise<boolean>;
export declare function gpsDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function generateQrCode(storeId: string): string;
export declare function sanitizeUser<T extends {
    passwordHash?: string;
}>(user: T): Omit<T, 'passwordHash'>;
