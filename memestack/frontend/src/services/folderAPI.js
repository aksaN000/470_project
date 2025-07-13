import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const folderAPI = axios.create({
    baseURL: `${API_URL}/folders`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
folderAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
folderAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Folder CRUD operations
export const createFolder = async (folderData) => {
    const response = await folderAPI.post('/', folderData);
    return response.data;
};

export const getUserFolders = async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await folderAPI.get(`/?${queryParams}`);
    return response.data;
};

export const getFolder = async (folderId) => {
    const response = await folderAPI.get(`/${folderId}`);
    return response.data;
};

export const updateFolder = async (folderId, folderData) => {
    const response = await folderAPI.put(`/${folderId}`, folderData);
    return response.data;
};

export const deleteFolder = async (folderId) => {
    const response = await folderAPI.delete(`/${folderId}`);
    return response.data;
};

// Meme management within folders
export const addMemeToFolder = async (folderId, memeId) => {
    const response = await folderAPI.post(`/${folderId}/memes/${memeId}`);
    return response.data;
};

export const removeMemeFromFolder = async (folderId, memeId) => {
    const response = await folderAPI.delete(`/${folderId}/memes/${memeId}`);
    return response.data;
};

export const bulkAddMemesToFolder = async (folderId, memeIds) => {
    const response = await folderAPI.post(`/${folderId}/memes/bulk`, { memeIds });
    return response.data;
};

// Sharing
export const generateShareLink = async (folderId) => {
    const response = await folderAPI.post(`/${folderId}/share`);
    return response.data;
};

export const getSharedFolder = async (token) => {
    const response = await folderAPI.get(`/shared/${token}`);
    return response.data;
};
