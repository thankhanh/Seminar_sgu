/**
 * Axios API Client dùng chung cho toàn bộ Mobile App
 * Base URL tự động chọn theo môi trường:
 *  - Android Emulator: 10.0.2.2 trỏ về localhost của máy host
 *  - Thiết bị thật: thay IP bằng địa chỉ máy tính trong LAN
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://10.0.2.2:3000/api/v1';
export const TOKEN_KEY = 'auth_access_token';
export const REFRESH_KEY = 'auth_refresh_token';
export const USER_KEY = 'auth_user';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tự động đính kèm token vào header nếu có
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        const { data } = await api.post('/auth/login', { email, password });
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

export default api;
