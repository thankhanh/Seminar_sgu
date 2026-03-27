import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// --- Axios Instance ---
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor ---
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Response Interceptor ---
api.interceptors.response.use(
    (response) => {
        // Backend wraps response in { success: boolean, data: any }
        return response.data.data;
    },
    (error) => {
        const result = error.response?.data;
        const message = result?.error?.message || result?.message || 'Có lỗi xảy ra khi gọi API';
        console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, result);
        return Promise.reject(new Error(message));
    }
);

// Define a helper to handle types better if needed, 
// but for now we'll just ensure the component sees the right data.

// --- Auth ---
export const authApi = {
    login: async (dto: any) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, dto);
        return response.data; // Auth endpoints often need the full response (tokens)
    },
    register: async (dto: any) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, dto);
        return response.data;
    },
    getMe: () => api.get('/auth/me'),
};

// --- Admin ---
export const adminApi = {
    getUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
    getMerchants: (page = 1, limit = 20) => api.get(`/admin/merchants?page=${page}&limit=${limit}`),
    approveMerchant: (id: string) => api.patch(`/admin/merchants/${id}/approve`),
    rejectMerchant: (id: string, reason: string) => api.patch(`/admin/merchants/${id}/reject`, { reason }),
    toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
    getStats: () => api.get('/admin/stats'),
    createUser: (dto: any) => api.post('/admin/users', dto),
};

// --- Merchant ---
export const merchantApi = {
    getMe: (t: number = Date.now()) => api.get(`/merchant/me?t=${t}`),
    register: (dto: any) => api.post('/merchant/register', dto),
};

// --- Stores ---
export const storesApi = {
    getAll: (page = 1, limit = 20, status?: string, merchantId?: string) => 
        api.get(`/stores?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}${merchantId ? `&merchantId=${merchantId}` : ''}`),
    getOne: (id: string) => api.get(`/stores/${id}`),
    create: (dto: any) => api.post('/stores', dto),
    update: (id: string, dto: any) => api.patch(`/stores/${id}`, dto),
    remove: (id: string) => api.delete(`/stores/${id}`),
    
    // Narrations (related to stores)
    getNarrations: (storeId: string) => api.get(`/stores/${storeId}/narrations`),
    createNarration: (storeId: string, dto: any) => api.post(`/stores/${storeId}/narrations`, dto),
};

// --- Narrations (Global) ---
export const narrationsApi = {
    getAll: (page = 1, limit = 20, merchantId?: string) => 
        api.get(`/narrations?page=${page}&limit=${limit}${merchantId ? `&merchantId=${merchantId}` : ''}`),
    update: (id: string, dto: any) => api.patch(`/narrations/${id}`, dto),
    remove: (id: string) => api.delete(`/narrations/${id}`),
};

// --- Languages ---
export const languagesApi = {
    getAll: () => api.get('/languages'),
    create: (dto: any) => api.post('/languages', dto),
    update: (id: string, dto: any) => api.patch(`/languages/${id}`, dto),
    remove: (id: string) => api.delete(`/languages/${id}`),
};

// --- Menus ---
export const menusApi = {
    getByStore: (storeId: string) => api.get(`/stores/${storeId}/menus`),
    create: (storeId: string, dto: any) => api.post(`/stores/${storeId}/menus`, dto),
    update: (id: string, dto: any) => api.patch(`/menus/${id}`, dto),
    remove: (id: string) => api.delete(`/menus/${id}`),
};

// --- Subscriptions ---
export const subscriptionsApi = {
    createMerchant: (dto: any) => api.post('/merchant-subscriptions', dto),
    createMerchantByAdmin: (dto: any) => api.post('/merchant-subscriptions/admin', dto),
    getMyMerchant: () => api.get('/merchant-subscriptions/my'),
    getAllMerchants: (page = 1, limit = 10) => api.get(`/merchant-subscriptions?page=${page}&limit=${limit}`),
    cancelMerchant: (id: string) => api.patch(`/merchant-subscriptions/${id}/cancel`),

    createUser: (dto: any) => api.post('/subscriptions', dto),
    getMyUser: () => api.get('/subscriptions/my'),
    getAllUsers: (page = 1, limit = 10) => api.get(`/subscriptions?page=${page}&limit=${limit}`),
    cancelUser: (id: string) => api.patch(`/subscriptions/${id}/cancel`),

    getAllPlanMetadata: () => api.get('/plan-metadata'),
    updatePlanMetadata: (key: string, data: any) => api.patch(`/plan-metadata/${key}`, data),
};

// --- Payments ---
export const paymentsApi = {
    create: (dto: any) => api.post('/payments/create', dto),
    getHistory: () => api.get('/payments/history'),
};
