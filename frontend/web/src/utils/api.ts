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
    getMe: () => api.get('/auth/me') as Promise<any>,
};

// --- Admin ---
export const adminApi = {
    getUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`) as Promise<any>,
    getMerchants: (page = 1, limit = 20) => api.get(`/admin/merchants?page=${page}&limit=${limit}`) as Promise<any>,
    approveMerchant: (id: string) => api.patch(`/admin/merchants/${id}/approve`) as Promise<any>,
    rejectMerchant: (id: string, reason: string) => api.patch(`/admin/merchants/${id}/reject`, { reason }) as Promise<any>,
    toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle-active`) as Promise<any>,
    getStats: () => api.get('/admin/stats') as Promise<any>,
    createUser: (dto: any) => api.post('/admin/users', dto) as Promise<any>,
};

// --- Merchant ---
export const merchantApi = {
    getMe: (t: number = Date.now()) => api.get(`/merchant/me?t=${t}`) as Promise<any>,
    register: (dto: any) => api.post('/merchant/register', dto) as Promise<any>,
};

// --- Stores ---
export const storesApi = {
    getAll: (page = 1, limit = 20, status?: string, merchantId?: string) => 
        api.get(`/stores?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}${merchantId ? `&merchantId=${merchantId}` : ''}`) as Promise<any>,
    getOne: (id: string) => api.get(`/stores/${id}`) as Promise<any>,
    create: (dto: any) => api.post('/stores', dto) as Promise<any>,
    update: (id: string, dto: any) => api.patch(`/stores/${id}`, dto) as Promise<any>,
    remove: (id: string) => api.delete(`/stores/${id}`) as Promise<any>,
    
    // Narrations (related to stores)
    getNarrations: (storeId: string) => api.get(`/stores/${storeId}/narrations`) as Promise<any>,
    createNarration: (storeId: string, dto: any) => api.post(`/stores/${storeId}/narrations`, dto) as Promise<any>,
};

// --- Narrations (Global) ---
export const narrationsApi = {
    getAll: (page = 1, limit = 20, merchantId?: string) => 
        api.get(`/narrations?page=${page}&limit=${limit}${merchantId ? `&merchantId=${merchantId}` : ''}`) as Promise<any>,
    update: (id: string, dto: any) => api.patch(`/narrations/${id}`, dto) as Promise<any>,
    remove: (id: string) => api.delete(`/narrations/${id}`) as Promise<any>,
};

// --- Languages ---
export const languagesApi = {
    getAll: () => api.get('/languages') as Promise<any>,
    create: (dto: any) => api.post('/languages', dto) as Promise<any>,
    update: (id: string, dto: any) => api.patch(`/languages/${id}`, dto) as Promise<any>,
    remove: (id: string) => api.delete(`/languages/${id}`) as Promise<any>,
};

// --- Menus ---
export const menusApi = {
    getByStore: (storeId: string) => api.get(`/stores/${storeId}/menus`) as Promise<any>,
    create: (storeId: string, dto: any) => api.post(`/stores/${storeId}/menus`, dto) as Promise<any>,
    update: (id: string, dto: any) => api.patch(`/menus/${id}`, dto) as Promise<any>,
    remove: (id: string) => api.delete(`/menus/${id}`) as Promise<any>,
};

// --- Subscriptions ---
export const subscriptionsApi = {
    createMerchant: (dto: any) => api.post('/merchant-subscriptions', dto) as Promise<any>,
    createMerchantByAdmin: (dto: any) => api.post('/merchant-subscriptions/admin', dto) as Promise<any>,
    getMyMerchant: () => api.get('/merchant-subscriptions/my') as Promise<any>,
    getAllMerchants: (page = 1, limit = 10) => api.get(`/merchant-subscriptions?page=${page}&limit=${limit}`) as Promise<any>,
    cancelMerchant: (id: string) => api.patch(`/merchant-subscriptions/${id}/cancel`) as Promise<any>,

    createUser: (dto: any) => api.post('/subscriptions', dto) as Promise<any>,
    getMyUser: () => api.get('/subscriptions/my') as Promise<any>,
    getAllUsers: (page = 1, limit = 10) => api.get(`/subscriptions?page=${page}&limit=${limit}`) as Promise<any>,
    cancelUser: (id: string) => api.patch(`/subscriptions/${id}/cancel`) as Promise<any>,

    getAllPlanMetadata: () => api.get('/plan-metadata') as Promise<any>,
    updatePlanMetadata: (key: string, data: any) => api.patch(`/plan-metadata/${key}`, data) as Promise<any>,
};

// --- Payments ---
export const paymentsApi = {
    create: (dto: any) => api.post('/payments/create', dto) as Promise<any>,
    getHistory: () => api.get('/payments/history') as Promise<any>,
};
