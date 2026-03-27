/**
 * API Utility for Smart Tour Web CMS
 * Refactored to use Axios for better interceptors and error handling.
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Parse Backend Wrapper and Handle Errors
apiClient.interceptors.response.use((response) => {
    // Backend wraps response in { success: boolean, data: any, message?: string }
    return response.data; // Keep the whole `{ success, data, message }` object
}, (error) => {
    console.error(`API Error:`, error.response?.data || error.message);
    const message = error.response?.data?.error?.message || error.response?.data?.message || 'Có lỗi xảy ra khi gọi API';
    return Promise.reject(new Error(message));
});

// --- Helper for the old apiFetch unwrapping ---
// Many existing APIs expect the unwrapped `data` object directly
const unwrapData = async (promise: Promise<any>) => {
    const response = await promise;
    return response.data; // This is the inner `data` from `{ success, data }`
};

// --- Auth ---
export const authApi = {
    login: async (dto: any) => {
        const response = await apiClient.post('/auth/login', dto);
        return response; // returns { success, data, message }
    },
    register: async (dto: any) => {
        const response = await apiClient.post('/auth/register', dto);
        return response; // returns { success, data, message }
    },
    getMe: () => unwrapData(apiClient.get('/auth/me')),
};

// --- Admin ---
export const adminApi = {
    getUsers: (page = 1, limit = 20) => unwrapData(apiClient.get(`/admin/users`, { params: { page, limit } })),
    getMerchants: (page = 1, limit = 20) => unwrapData(apiClient.get(`/admin/merchants`, { params: { page, limit } })),
    approveMerchant: (id: string) => unwrapData(apiClient.patch(`/admin/merchants/${id}/approve`)),
    rejectMerchant: (id: string, reason: string) => unwrapData(apiClient.patch(`/admin/merchants/${id}/reject`, { reason })),
    toggleUser: (id: string) => unwrapData(apiClient.patch(`/admin/users/${id}/toggle-active`)),
    getStats: () => unwrapData(apiClient.get('/admin/stats')),
    createUser: (dto: any) => unwrapData(apiClient.post('/admin/users', dto)),
};

// --- Merchant ---
export const merchantApi = {
    getMe: (t: number = Date.now()) => unwrapData(apiClient.get(`/merchant/me`, { params: { t } })),
    register: (dto: any) => unwrapData(apiClient.post('/merchant/register', dto)),
};

// --- Stores ---
export const storesApi = {
    getAll: (page = 1, limit = 20, status?: string, merchantId?: string) => 
        unwrapData(apiClient.get(`/stores`, { params: { page, limit, status, merchantId } })),
    getOne: (id: string) => unwrapData(apiClient.get(`/stores/${id}`)),
    create: (dto: any) => unwrapData(apiClient.post('/stores', dto)),
    update: (id: string, dto: any) => unwrapData(apiClient.patch(`/stores/${id}`, dto)),
    remove: (id: string) => unwrapData(apiClient.delete(`/stores/${id}`)),
    
    // Narrations (related to stores)
    getNarrations: (storeId: string) => unwrapData(apiClient.get(`/stores/${storeId}/narrations`)),
    createNarration: (storeId: string, dto: any) => unwrapData(apiClient.post(`/stores/${storeId}/narrations`, dto)),
};

// --- Narrations (Global) ---
export const narrationsApi = {
    getAll: (page = 1, limit = 20, merchantId?: string) => 
        unwrapData(apiClient.get(`/narrations`, { params: { page, limit, merchantId } })),
    update: (id: string, dto: any) => unwrapData(apiClient.patch(`/narrations/${id}`, dto)),
    remove: (id: string) => unwrapData(apiClient.delete(`/narrations/${id}`)),
};

// --- Languages ---
export const languagesApi = {
    getAll: () => unwrapData(apiClient.get('/languages')),
    create: (dto: any) => unwrapData(apiClient.post('/languages', dto)),
    update: (id: string, dto: any) => unwrapData(apiClient.patch(`/languages/${id}`, dto)),
    remove: (id: string) => unwrapData(apiClient.delete(`/languages/${id}`)),
};

// --- Menus ---
export const menusApi = {
    getByStore: (storeId: string) => unwrapData(apiClient.get(`/stores/${storeId}/menus`)),
    create: (storeId: string, dto: any) => unwrapData(apiClient.post(`/stores/${storeId}/menus`, dto)),
    update: (id: string, dto: any) => unwrapData(apiClient.patch(`/menus/${id}`, dto)),
    remove: (id: string) => unwrapData(apiClient.delete(`/menus/${id}`)),
};

// --- Subscriptions ---
export const subscriptionsApi = {
    create: (dto: any) => unwrapData(apiClient.post('/merchant-subscriptions', dto)),
    getMy: () => unwrapData(apiClient.get('/merchant-subscriptions/my')),
    getAll: (page = 1, limit = 10) => unwrapData(apiClient.get(`/merchant-subscriptions`, { params: { page, limit } })),
    cancel: (id: string) => unwrapData(apiClient.patch(`/merchant-subscriptions/${id}/cancel`)),
};

// --- Payments ---
export const paymentsApi = {
    create: (dto: any) => unwrapData(apiClient.post('/payments/create', dto)),
    getHistory: () => unwrapData(apiClient.get('/payments/history')),
};
