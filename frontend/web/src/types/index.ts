/**
 * Centralized Types for Smart Tour Web CMS
 * Synchronized with backend prisma/schema.prisma
 */

export type UserRole = 'user' | 'merchant' | 'admin';

export type StoreStatus = 'pending' | 'active' | 'hidden';

export type MerchantStatus = 'pending' | 'approved' | 'rejected' | 'blocked';


export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Store {
    id: string;
    merchantId: string;
    name: string;
    description?: string;
    address: string;
    lat: number;
    lng: number;
    openTime?: string;
    closeTime?: string;
    coverImage?: string;
    status: StoreStatus;
    createdAt?: string;
    updatedAt?: string;
    merchant?: {
        businessName: string;
    };
    images?: StoreImage[];
    menus?: any[];
    narrations?: any[];
    _count?: {
        menus: number;
        narrations: number;
    };
}

export interface StoreImage {
    id: string;
    storeId: string;
    imageUrl: string;
    sortOrder: number;
}

export interface Menu {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
}

export interface Narration {
    id: string;
    storeId: string;
    languageId: string;
    audioUrl?: string;
    textContent?: string;
    duration?: number;
    isActive: boolean;
    language?: Language;
    store?: { name: string };
}

export interface Language {
    id: string;
    code: string;
    name: string;
    flagIcon: string;
    isActive: boolean;
}

export interface Merchant {
    id: string;
    userId: string;
    businessName: string;
    taxCode: string | null;
    status: MerchantStatus;
    rejectReason: string | null;
    createdAt: string;
    user?: User;
    stores?: Store[];
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
}
