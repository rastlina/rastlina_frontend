// Rastlina — api.ts
// All API calls to the Django backend

import axios from 'axios';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface BulkOrderPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  product_type: string;
  quantity: number;
  requirements?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  order_id?: string;
  issue_type: string;
  message: string;
}

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rastlinaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/google') ||
        error.config.url.includes('/auth/signup');

      if (!isAuthRequest) {
        localStorage.removeItem('rastlinaToken');
        localStorage.removeItem('rastlinaUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login/', credentials);
    const token = res.data.access;
    if (token) {
      localStorage.setItem('rastlinaToken', token);
      localStorage.setItem('rastlinaUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  googleLogin: async (code: string) => {
    const res = await api.post('/auth/google/', {
      code,
      callback_url: 'postmessage',
    });
    // JWT may come as access or access_token
    const token = res.data.access || res.data.access_token;
    if (token) {
      localStorage.setItem('rastlinaToken', token);
    }
    // Fetch full profile after Google login
    const profile = await authService.getProfile();
    localStorage.setItem('rastlinaUser', JSON.stringify(profile));
    return { ...res.data, user: profile };
  },

  signup: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
  }) => (await api.post('/auth/signup/', data)).data,

  getProfile: async () => (await api.get('/auth/user/')).data,

  updateProfile: async (data: FormData | Partial<{
    first_name: string;
    last_name: string;
    phone: string;
  }>) => {
    const isFormData = data instanceof FormData;
    const res = await api.patch('/auth/user/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    localStorage.setItem('rastlinaUser', JSON.stringify(res.data));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('rastlinaToken');
    localStorage.removeItem('rastlinaUser');
  },

  isLoggedIn: () => !!localStorage.getItem('rastlinaToken'),

  getStoredUser: () => {
    const u = localStorage.getItem('rastlinaUser');
    return u ? JSON.parse(u) : null;
  },

  // Addresses
  getSavedAddresses: async () => (await api.get('/auth/addresses/')).data,
  saveAddress: async (data: any) => {
    if (data.id) return (await api.put(`/auth/addresses/${data.id}/`, data)).data;
    return (await api.post('/auth/addresses/', data)).data;
  },
  deleteAddress: async (id: number) => (await api.delete(`/auth/addresses/${id}/`)).data,
  setDefaultAddress: async (id: number) =>
    (await api.post(`/auth/addresses/${id}/set-default/`)).data,
};

// ─── STORE ────────────────────────────────────────────────────────────────────

export const storeService = {
  // Navigation
  getNavbarData: async () => (await api.get('/store/navbar/')).data,
  getMainCategories: async () => (await api.get('/store/main-categories/')).data,

  getCategories: async (params?: {
    main_category?: string;
    featured?: boolean;
  }) => (await api.get('/store/categories/', { params })).data,

  getSpaces: async (params?: { featured?: boolean }) =>
    (await api.get('/store/spaces/', { params })).data,

  getBrands: async () => (await api.get('/store/brands/')).data,

  // Products
  getProducts: async (params?: {
    main_category?: string;
    category?: string;
    space?: string;
    size?: string;
    color?: string;
    care_level?: string;
    pet_friendly?: boolean;
    air_purifying?: boolean;
    min_price?: number;
    max_price?: number;
    is_new_arrival?: boolean;
    is_best_seller?: boolean;
    is_trending?: boolean;
    is_best_deal?: boolean;
    search?: string;
    ordering?: string;
  }) => (await api.get('/store/products/', { params })).data,

  getProductBySlug: async (slug: string) =>
    (await api.get(`/store/products/${slug}/`)).data,

  // Filter options for dynamic filter sidebar
  getFilterOptions: async (params?: {
    main_category?: string;
    category?: string;
  }) => (await api.get('/store/filter-options/', { params })).data,

  // Reviews
  getReviews: async (slug: string) =>
    (await api.get(`/store/products/${slug}/reviews/`)).data,
  addReview: async (slug: string, formData: FormData) =>
    (await api.post(`/store/products/${slug}/reviews/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,

  // Home data (all homepage sections in one request)
  getHomeData: async () => (await api.get('/store/home-data/')).data,

  // Search
  searchProducts: async (query: string) => {
    if (!query.trim()) return { products: [], categories: [], spaces: [] };
    return (await api.get('/store/search/', { params: { q: query.trim() } })).data;
  },

  // Config & Coupons
  getSiteConfig: async () => (await api.get('/store/config/')).data,
  validateCoupon: async (code: string, orderTotal: number) =>
    (await api.post('/store/validate-coupon/', { code, order_total: orderTotal })).data,
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const orderService = {
  createOrder: async (orderData: any) =>
    (await api.post('/orders/checkout/', orderData)).data,

  getUserOrders: async (page = 1) =>
    (await api.get(`/orders/?page=${page}`)).data,

  getOrderDetail: async (id: number) =>
    (await api.get(`/orders/${id}/`)).data,

  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => (await api.post('/payments/verify/', paymentData)).data,

  cancelOrder: async (orderId: number) =>
    (await api.post(`/orders/${orderId}/cancel/`)).data,
};

// ─── FORMS ────────────────────────────────────────────────────────────────────

export const submitBulkOrder = (data: BulkOrderPayload) =>
  api.post<{ detail: string }>('/forms/bulk-order/', data);

export const submitContactForm = (data: ContactPayload) =>
  api.post<{ detail: string }>('/forms/contact/', data);

export default api;