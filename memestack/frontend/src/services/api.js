// 🔗 API Service Layer
// This handles all communication with our backend API

import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ========================================
// INTERCEPTORS
// ========================================

// Request interceptor - Add auth token to requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle global errors
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            // Check if backend is running
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                const backendRunning = error.config?.url?.includes('localhost:5000');
                if (backendRunning) {
                    error.message = 'Backend server is not running. Please start the backend server on port 5000.';
                }
            }
            return Promise.reject(error);
        }

        // Handle HTTP errors
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        // Log API errors for debugging
        console.error('API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data
        });
        
        return Promise.reject(error);
    }
);

// ========================================
// AUTHENTICATION SERVICES
// ========================================

export const authAPI = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await API.post('/auth/register', userData);
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            // Transform email to identifier for backend compatibility
            const loginData = {
                identifier: credentials.email || credentials.identifier,
                password: credentials.password
            };
            
            const response = await API.post('/auth/login', loginData);
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    // Logout user
    logout: async () => {
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await API.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get profile' };
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await API.put('/auth/profile', profileData);
            if (response.data.success && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update profile' };
        }
    },
};

// ========================================
// MEME SERVICES
// ========================================

export const memeAPI = {
    // Get all public memes with pagination and filters
    getAllMemes: async (params = {}) => {
        try {
            const response = await API.get('/memes', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch memes' };
        }
    },

    // Get trending memes
    getTrendingMemes: async (limit = 10) => {
        try {
            const response = await API.get('/memes/trending', { params: { limit } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trending memes' };
        }
    },

    // Get memes by category
    getMemesByCategory: async (category, params = {}) => {
        try {
            const response = await API.get(`/memes/category/${category}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch memes by category' };
        }
    },

    // Get single meme by ID
    getMemeById: async (id) => {
        try {
            const response = await API.get(`/memes/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch meme' };
        }
    },

    // Create new meme
    createMeme: async (memeData) => {
        try {
            const response = await API.post('/memes', memeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create meme' };
        }
    },

    // Update meme
    updateMeme: async (id, memeData) => {
        try {
            const response = await API.put(`/memes/${id}`, memeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update meme' };
        }
    },

    // Delete meme
    deleteMeme: async (id) => {
        try {
            const response = await API.delete(`/memes/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete meme' };
        }
    },

    // Like/Unlike meme
    toggleLike: async (id) => {
        try {
            const response = await API.post(`/memes/${id}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to toggle like' };
        }
    },

    // Share meme
    shareMeme: async (id) => {
        try {
            const response = await API.post(`/memes/${id}/share`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to share meme' };
        }
    },

    // Download meme
    downloadMeme: async (id) => {
        try {
            const response = await API.get(`/memes/${id}/download`, {
                responseType: 'blob' // Important for file downloads
            });
            return response;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to download meme' };
        }
    },

    // Get current user's memes
    getMyMemes: async (includePrivate = true) => {
        try {
            const response = await API.get('/memes/my-memes', {
                params: { includePrivate }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch your memes' };
        }
    },

    // Get memes by specific user
    getUserMemes: async (userId) => {
        try {
            const response = await API.get(`/memes/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user memes' };
        }
    },

    // Get meme statistics
    getStats: async () => {
        try {
            const response = await API.get('/memes/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch statistics' };
        }
    },
};

// ========================================
// FILE UPLOAD SERVICES
// ========================================

export const uploadAPI = {
    // Upload meme image
    uploadMeme: async (file, onUploadProgress) => {
        try {
            const formData = new FormData();
            formData.append('meme', file);

            const response = await API.post('/upload/meme', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: onUploadProgress ? (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                } : undefined,
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to upload file' };
        }
    },

    // Upload avatar/profile picture
    uploadAvatar: async (file, onUploadProgress) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await API.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: onUploadProgress ? (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                } : undefined,
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to upload avatar' };
        }
    },

    // Get upload guidelines
    getGuidelines: async () => {
        try {
            const response = await API.get('/upload/guidelines');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch guidelines' };
        }
    },
};

// ========================================
// FOLLOW SERVICES
// ========================================

export const followAPI = {
    // Follow a user
    followUser: async (userId) => {
        try {
            const response = await API.post(`/follows/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to follow user' };
        }
    },

    // Unfollow a user
    unfollowUser: async (userId) => {
        try {
            const response = await API.delete(`/follows/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to unfollow user' };
        }
    },

    // Check if following a user
    getFollowStatus: async (userId) => {
        try {
            const response = await API.get(`/follows/${userId}/status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get follow status' };
        }
    },

    // Get user's followers
    getFollowers: async (userId, params = {}) => {
        try {
            const response = await API.get(`/follows/${userId}/followers`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get followers' };
        }
    },

    // Get user's following list
    getFollowing: async (userId, params = {}) => {
        try {
            const response = await API.get(`/follows/${userId}/following`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get following list' };
        }
    },

    // Get feed from followed users
    getFollowingFeed: async (params = {}) => {
        try {
            const response = await API.get('/follows/feed', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get following feed' };
        }
    },
};

// ========================================
// TEMPLATES API
// ========================================

export const templatesAPI = {
    // Get all templates
    getTemplates: async (params = {}) => {
        try {
            const response = await API.get('/templates', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch templates' };
        }
    },

    // Get template by ID
    getTemplateById: async (id) => {
        try {
            const response = await API.get(`/templates/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch template' };
        }
    },

    // Create new template
    createTemplate: async (templateData) => {
        try {
            const response = await API.post('/templates', templateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create template' };
        }
    },

    // Update template
    updateTemplate: async (id, templateData) => {
        try {
            const response = await API.put(`/templates/${id}`, templateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update template' };
        }
    },

    // Delete template
    deleteTemplate: async (id) => {
        try {
            const response = await API.delete(`/templates/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete template' };
        }
    },

    // Get template categories
    getCategories: async () => {
        try {
            const response = await API.get('/templates/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch template categories' };
        }
    },

    // Get user's templates
    getUserTemplates: async () => {
        try {
            const response = await API.get('/templates/my-templates');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user templates' };
        }
    }
};

// ========================================
// USER SERVICES
// ========================================

export const userAPI = {
    // Get all users for browsing/discovery
    getUsers: async (params = {}) => {
        try {
            const response = await API.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch users' };
        }
    },

    // Get user profile by ID
    getUserById: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get user profile' };
        }
    },
};

// ========================================
// ANALYTICS API
// ========================================

export const analyticsAPI = {
    // Get dashboard analytics
    getDashboard: async (timeRange = '30') => {
        try {
            const response = await API.get('/analytics/dashboard', {
                params: { timeRange }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch dashboard analytics' };
        }
    },

    // Get meme analytics
    getMemeAnalytics: async (memeId) => {
        try {
            const response = await API.get(`/analytics/meme/${memeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch meme analytics' };
        }
    },

    // Get platform analytics
    getPlatformAnalytics: async () => {
        try {
            const response = await API.get('/analytics/platform');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch platform analytics' };
        }
    }
};

// ========================================
// FOLDERS API
// ========================================

export const foldersAPI = {
    // Get user folders
    getFolders: async (params = {}) => {
        try {
            const response = await API.get('/folders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch folders' };
        }
    },

    // Get folder by ID
    getFolderById: async (id) => {
        try {
            const response = await API.get(`/folders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch folder' };
        }
    },

    // Create new folder
    createFolder: async (folderData) => {
        try {
            const response = await API.post('/folders', folderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create folder' };
        }
    },

    // Update folder
    updateFolder: async (id, folderData) => {
        try {
            const response = await API.put(`/folders/${id}`, folderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update folder' };
        }
    },

    // Delete folder
    deleteFolder: async (id) => {
        try {
            const response = await API.delete(`/folders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete folder' };
        }
    },

    // Add meme to folder
    addMemeToFolder: async (folderId, memeId) => {
        try {
            const response = await API.post(`/folders/${folderId}/memes/${memeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add meme to folder' };
        }
    },

    // Remove meme from folder
    removeMemeFromFolder: async (folderId, memeId) => {
        try {
            const response = await API.delete(`/folders/${folderId}/memes/${memeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to remove meme from folder' };
        }
    },

    // Bulk add memes to folder
    bulkAddMemesToFolder: async (folderId, memeIds) => {
        try {
            const response = await API.post(`/folders/${folderId}/memes/bulk`, { memeIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add memes to folder' };
        }
    },

    // Generate share link for folder
    generateShareLink: async (folderId) => {
        try {
            const response = await API.post(`/folders/${folderId}/share`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to generate share link' };
        }
    }
};


// ========================================
// HEALTH CHECK API
// ========================================

export const healthAPI = {
    // Check API health
    checkHealth: async () => {
        try {
            const response = await API.get('/health');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to check API health' };
        }
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get current user from localStorage
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    return !!(token && user);
};

// Get auth token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Clear auth data
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Error handler helper
export const handleAPIError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || 'An error occurred';
    } else if (error.request) {
        // Request was made but no response received
        return 'Network error. Please check your connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred';
    }
};

// ========================================
// COMMENTS API
// ========================================

export const commentsAPI = {
    // Get comments for a meme
    getComments: async (memeId, options = {}) => {
        try {
            const response = await API.get(`/comments/memes/${memeId}/comments`, {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch comments' };
        }
    },

    // Add comment to meme
    addComment: async (memeId, commentData) => {
        try {
            const response = await API.post(`/comments/memes/${memeId}/comments`, commentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add comment' };
        }
    },

    // Update comment
    updateComment: async (commentId, commentData) => {
        try {
            const response = await API.put(`/comments/${commentId}`, commentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update comment' };
        }
    },

    // Delete comment
    deleteComment: async (commentId) => {
        try {
            const response = await API.delete(`/comments/${commentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete comment' };
        }
    },

    // Toggle like on comment
    toggleLikeComment: async (commentId) => {
        try {
            const response = await API.post(`/comments/${commentId}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to toggle like' };
        }
    },

    // Get replies for a comment
    getReplies: async (commentId, options = {}) => {
        try {
            const response = await API.get(`/comments/${commentId}/replies`, {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch replies' };
        }
    },

    // Report comment
    reportComment: async (commentId, reportData) => {
        try {
            const response = await API.post(`/comments/${commentId}/report`, reportData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to report comment' };
        }
    },

    // Get user's comments
    getUserComments: async (userId, options = {}) => {
        try {
            const response = await API.get(`/comments/users/${userId}/comments`, {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user comments' };
        }
    }
};

// ========================================
// GROUPS API
// ========================================
export const groupsAPI = {
    // Get all groups
    getGroups: async (options = {}) => {
        try {
            const response = await API.get('/groups', {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch groups' };
        }
    },

    // Get trending groups
    getTrending: async () => {
        try {
            const response = await API.get('/groups/trending');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trending groups' };
        }
    },

    // Get user's groups
    getUserGroups: async () => {
        try {
            const response = await API.get('/groups/user/groups');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user groups' };
        }
    }
};

// ========================================
// COLLABORATIONS API
// ========================================
export const collaborationsAPI = {
    // Get all collaborations
    getCollaborations: async (options = {}) => {
        try {
            const response = await API.get('/collaborations', {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch collaborations' };
        }
    },

    // Get trending collaborations
    getTrending: async () => {
        try {
            const response = await API.get('/collaborations/trending');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trending collaborations' };
        }
    },

    // Get user's collaborations
    getUserCollaborations: async () => {
        try {
            const response = await API.get('/collaborations/user/collaborations');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user collaborations' };
        }
    }
};

// ========================================
// CHALLENGES API
// ========================================
export const challengesAPI = {
    // Get all challenges
    getChallenges: async (options = {}) => {
        try {
            const response = await API.get('/challenges', {
                params: options
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch challenges' };
        }
    },

    // Get trending challenges
    getTrending: async () => {
        try {
            const response = await API.get('/challenges/trending');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trending challenges' };
        }
    },

    // Get user's challenges
    getUserChallenges: async () => {
        try {
            const response = await API.get('/challenges/user/challenges');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user challenges' };
        }
    }
};

export default API;
