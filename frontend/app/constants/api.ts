/**
 * Axios API Client dùng chung cho toàn bộ Mobile App
 * Base URL tự động chọn theo môi trường:
 *  - Android Emulator: 10.0.2.2 trỏ về localhost của máy host
 *  - Thiết bị thật: thay IP bằng địa chỉ máy tính trong LAN
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.1.6:3000/api/v1'; // LAN IP for Physical Devices (Hotspot)
// export const API_URL = 'http://10.0.2.2:3000/api/v1'; // For Android Emulator
export const TOKEN_KEY = 'auth_access_token';
export const REFRESH_KEY = 'auth_refresh_token';
export const USER_KEY = 'auth_user';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tự động đính kèm token và ngôn ngữ vào header
api.interceptors.request.use(async (config) => {
    // 1. Gắn Token
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Gắn Ngôn ngữ
    const langData = await AsyncStorage.getItem('@smart_tour_lang');
    if (langData) {
        try {
            const parsed = JSON.parse(langData);
            if (parsed && parsed.code) {
                config.headers['accept-language'] = parsed.code;
            }
        } catch (e) {
            console.warn('[API Interceptor] Lỗi parse ngôn ngữ:', e);
        }
    }

    return config;
});

// Response interceptor: log lỗi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error.config?.url, error.response?.status, error.message);
        return Promise.reject(error);
    }
);

// ─── Auth Helpers ─────────────────────────────────────────────────
export const authHelpers = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        // Backend wraps response in { success: true, data: { accessToken, refreshToken, user } }
        const { success, data, message } = response.data;

        if (!success) {
            throw new Error(message || 'Đăng nhập thất bại');
        }

        if (data.accessToken) {
            await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
        }
        if (data.refreshToken) {
            await AsyncStorage.setItem(REFRESH_KEY, data.refreshToken);
        }
        if (data.user) {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
        return data;
    },

    async register(name: string, email: string, password: string) {
        const response = await api.post('/auth/register', { name, email, password });
        const { success, data, message } = response.data;

        if (!success) {
            throw new Error(message || 'Đăng ký thất bại');
        }

        if (data.accessToken) {
            await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
        }
        if (data.refreshToken) {
            await AsyncStorage.setItem(REFRESH_KEY, data.refreshToken);
        }
        if (data.user) {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
        return data;
    },

    async logout() {
        try { await api.post('/auth/logout'); } catch (_) { }
        await Promise.all([
            AsyncStorage.removeItem(TOKEN_KEY),
            AsyncStorage.removeItem(REFRESH_KEY),
            AsyncStorage.removeItem(USER_KEY),
        ]);
    },

    async getUser() {
        const raw = await AsyncStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    async isLoggedIn(): Promise<boolean> {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return !!token;
    },
};

// ─── Users Helpers ─────────────────────────────────────────────────
export const usersHelpers = {
    async getProfile() {
        const response = await api.get('/users/me');
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch profile');
        }
        return data;
    },
    async getListenHistory() {
        const response = await api.get('/users/listen-history');
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch history');
        }
        return data;
    },
    async updateProfile(data: any) {
        const response = await api.patch('/users/me', data);
        const dataResponse = response.data;
        if (!dataResponse.success) {
            throw new Error(dataResponse.message || 'Failed to update profile');
        }
        return dataResponse;
    },
    async uploadAvatar(formData: FormData) {
        const response = await api.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to upload avatar');
        }
        return data;
    }
};
// store
export const storeHelpers = {
    async getStore(keyword?: string, status?: string) {
        const response = await api.get('/stores', {
            params: { keyword, status },
        });
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch store');
        }
        return data;
    },
    async checkNearBy(lat: number, lng: number, lang: string) {
        const response = await api.get('/nearby', {
            params: { lat, lng, lang },
        });
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to check near by');
        }
        return data;
    },
    async getMenuStores(storeId: string) {
        const response = await api.get(`/stores/${storeId}/menus`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch menu');
        }
        return data;
    },
    async getStoreById(storeId: string) {
        const response = await api.get(`/stores/${storeId}`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch store');
        }
        return data;
    }
};

// narrations
export const narrationsHelpers = {
    async getNarrationsByStoreId(storeId: string) {
        const response = await api.get(`/stores/${storeId}/narrations`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch narrations');
        }
        return data;
    },
    async addListenHistory(narrationId: string, source?: string) {
        const response = await api.post(`/listen/${narrationId}${source ? `?source=${source}` : ''}`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to add listen history');
        }
        return data;
    }
};
// plan-metadata
export const planMetadataHelpers = {
    async getMetadata() {
        const response = await api.get('/plan-metadata');
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch plan-metadata');
        }
        return data;
    }
};
// plans
export const plansHelpers = {
    async getPlans() {
        const response = await api.get('/plans');
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch plans');
        }
        return data;
    }
};
// subscriptions
export const subscriptionsHelpers = {
    async getMySubscriptions() {
        const response = await api.get('/subscriptions/my');
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to fetch subscriptions');
        }
        return data;
    }
};
// payment
export const paymentHelpers = {
    async createPayment(method: string, type: string, amount: number, orderInfo: string) {
        const response = await api.post('/payments/create', {
            method,
            type,
            amount,
            orderInfo,
        });
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to create payment');
        }
        return data;
    },
    async getPaymentStatus(transactionId: string) {
        const response = await api.get(`/payments/status?transactionId=${transactionId}`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to get payment status');
        }
        return data;
    }
};
// scanner
export const scannerHelpers = {
    async scanQR(requestData: string) {
        const response = await api.post(`/qr/scan/${requestData}`);
        const { success, data, message } = response.data;
        if (!success) {
            throw new Error(message || 'Failed to scan QR');
        }
        return data;
    }
};
export default api;
