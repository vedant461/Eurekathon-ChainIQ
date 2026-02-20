import axios from 'axios';

// Base API Configuration
const API_URL = 'http://localhost:8000'; // FastAPI Backend

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Auth Token if exists
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // or 'access_token'
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (401, etc.)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or clear token
            // window.location.href = '/login';
            console.warn('Unauthorized access. Token might be invalid.');
        }
        return Promise.reject(error);
    }
);

// API Service Layer
const api = {
    // Auth (Placeholder for Phase 2)
    login: (credentials) => client.post('/auth/login', credentials),
    register: (data) => client.post('/auth/register', data),

    // Onboarding (Placeholder for Phase 3)
    generateProcesses: (data) => client.post('/api/v2/generate-processes', data),
    generateRoleProcesses: (data) => client.post('/api/v2/generate-role-processes', data),

    // Dashboard (Phase 4)
    getKPIs: () => client.get('/api/kpis'),
    getNodePerformance: () => client.get('/api/node-performance'),
    getBottlenecks: () => client.get('/api/bottlenecks'),
    generateInsight: (payload) => client.post('/api/generate-insight', payload), // V1

    // V2 Endpoints (If needed)
    ingest: (payload) => client.post('/api/v2/ingest', payload),
    simulate: (payload) => client.post('/api/v2/simulate', payload),
    simulate: (payload) => client.post('/api/v2/simulate', payload),
    metricTree: () => client.get('/api/v2/tree'),
    metricTree: () => client.get('/api/v2/tree'),
    getEvents: () => client.get('/api/v2/events'),

    // Phase 15: Marketplace
    getSuppliers: (filters) => client.get('/api/v2/marketplace/suppliers', { params: filters }),
    placeOrder: (data) => client.post('/api/v2/orders/place', data),
    getSupplierOrders: (supplierId) => client.get(`/api/v2/orders/supplier/${supplierId}`),
    acceptOrder: (orderId) => client.put(`/api/v2/orders/${orderId}/accept`),
    getRetailerOrders: (retailerId) => client.get(`/api/v2/orders/retailer/${retailerId}`),

    // Phase 16: Tracker
    getTracker: (batchId) => client.get(`/api/v2/tracker/${batchId}`),

    // Phase 17: Supplier Dashboard
    getSupplierKPIs: (supplierId) => client.get(`/api/v2/supplier/${supplierId}/kpis`),
    getSupplierBottlenecks: (supplierId) => client.get(`/api/v2/supplier/${supplierId}/process-bottlenecks`),
    generateSupplierInsight: (supplierId) => client.post(`/api/v2/supplier/${supplierId}/generate-insight`),
};

export default api;
