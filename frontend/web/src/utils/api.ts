/**
 * API Utility for Smart Tour Web CMS
 * Strictly matches the backend schema and endpoints.
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';

// --- Base Fetch Wrapper ---
async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('admin_token');
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const result = await response.json();

    if (!response.ok) {
        const message = result.error?.message || result.message || 'Có lỗi xảy ra khi gọi API';
        throw new Error(message);
    }

    // Backend wraps response in { success: boolean, data: any }
    return result.data;
}

// --- Auth ---
export const authApi = {
    login: async (dto: any) => {
        const result = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto),
        });
        const data = await result.json();
        if (!result.ok) {
            const message = data.error?.message || data.message || 'Đăng nhập thất bại';
            throw new Error(message);
        }
        return data; // Returns { success, data, message }
    },
    register: async (dto: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto),
        });
        const result = await response.json();
        if (!response.ok) {
            const message = result.error?.message || result.message || 'Đăng ký thất bại';
            throw new Error(message);
        }
        return result; // Returns { success, data, message }
    },
    getMe: () => apiFetch('/auth/me'),
};

// --- Admin ---
export const adminApi = {
    getUsers: (page = 1, limit = 20) => apiFetch(`/admin/users?page=${page}&limit=${limit}`),
    getMerchants: (page = 1, limit = 20) => apiFetch(`/admin/merchants?page=${page}&limit=${limit}`),
    approveMerchant: (id: string) => apiFetch(`/admin/merchants/${id}/approve`, { method: 'PATCH' }),
    rejectMerchant: (id: string, reason: string) => apiFetch(`/admin/merchants/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    }),
    toggleUser: (id: string) => apiFetch(`/admin/users/${id}/toggle-active`, { method: 'PATCH' }),
    getStats: () => apiFetch('/admin/stats'),
    createUser: (dto: any) => apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
};

// --- Merchant ---
export const merchantApi = {
    getMe: (t: number = Date.now()) => apiFetch(`/merchant/me?t=${t}`),
    register: (dto: any) => apiFetch('/merchant/register', {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
};

// --- Stores ---
export const storesApi = {
    getAll: (page = 1, limit = 20, status?: string) => 
        apiFetch(`/stores?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
    getOne: (id: string) => apiFetch(`/stores/${id}`),
    create: (dto: any) => apiFetch('/stores', {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
    update: (id: string, dto: any) => apiFetch(`/stores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
    }),
    remove: (id: string) => apiFetch(`/stores/${id}`, { method: 'DELETE' }),
    
    // Narrations (related to stores)
    getNarrations: (storeId: string) => apiFetch(`/stores/${storeId}/narrations`),
    createNarration: (storeId: string, dto: any) => apiFetch(`/stores/${storeId}/narrations`, {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
};

// --- Narrations (Global) ---
export const narrationsApi = {
    getAll: (page = 1, limit = 20) => apiFetch(`/narrations?page=${page}&limit=${limit}`),
    update: (id: string, dto: any) => apiFetch(`/narrations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
    }),
    remove: (id: string) => apiFetch(`/narrations/${id}`, { method: 'DELETE' }),
};

// --- Languages ---
export const languagesApi = {
    getAll: () => apiFetch('/languages'),
    create: (dto: any) => apiFetch('/languages', {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
    update: (id: string, dto: any) => apiFetch(`/languages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
    }),
    remove: (id: string) => apiFetch(`/languages/${id}`, { method: 'DELETE' }),
};

// --- Menus ---
export const menusApi = {
    getByStore: (storeId: string) => apiFetch(`/stores/${storeId}/menus`),
    create: (storeId: string, dto: any) => apiFetch(`/stores/${storeId}/menus`, {
        method: 'POST',
        body: JSON.stringify(dto),
    }),
    update: (id: string, dto: any) => apiFetch(`/menus/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
    }),
    remove: (id: string) => apiFetch(`/menus/${id}`, { method: 'DELETE' }),
};
