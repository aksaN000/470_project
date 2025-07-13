import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const moderationAPI = axios.create({
    baseURL: `${API_URL}/moderation`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
moderationAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
moderationAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Public functions (require authentication)
export const submitReport = async (reportData) => {
    const response = await moderationAPI.post('/report', reportData);
    return response.data;
};

// Admin functions (require admin privileges)
export const getReports = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await moderationAPI.get(`/reports?${params}`);
    return response.data;
};

export const reviewReport = async (reportId, action, reason) => {
    const response = await moderationAPI.put(`/reports/${reportId}/review`, {
        action,
        reason
    });
    return response.data;
};

export const dismissReport = async (reportId, reason) => {
    const response = await moderationAPI.put(`/reports/${reportId}/dismiss`, {
        reason
    });
    return response.data;
};

export const getModerationDashboard = async () => {
    const response = await moderationAPI.get('/dashboard');
    return response.data;
};

export const warnUser = async (userId, reason, reportId) => {
    const response = await moderationAPI.post(`/users/${userId}/warn`, {
        reason,
        reportId
    });
    return response.data;
};

export const suspendUser = async (userId, reason, days, reportId) => {
    const response = await moderationAPI.post(`/users/${userId}/suspend`, {
        reason,
        days,
        reportId
    });
    return response.data;
};

export const banUser = async (userId, reason, reportId) => {
    const response = await moderationAPI.post(`/users/${userId}/ban`, {
        reason,
        reportId
    });
    return response.data;
};

export const unbanUser = async (userId) => {
    const response = await moderationAPI.post(`/users/${userId}/unban`);
    return response.data;
};
