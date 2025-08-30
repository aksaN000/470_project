// 📊 Analytics API Service
// Handles all analytics-related API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
};

// Get user dashboard analytics
export const getDashboardAnalytics = async (timeRange = 30) => {
    try {
        console.log('🔄 Fetching dashboard analytics...');
        
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard?timeRange=${timeRange}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);
        console.log('✅ Dashboard analytics fetched:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Error fetching dashboard analytics:', error);
        throw error;
    }
};

// Get specific meme analytics
export const getMemeAnalytics = async (memeId) => {
    try {
        console.log('🔄 Fetching meme analytics for:', memeId);
        
        const response = await fetch(`${API_BASE_URL}/analytics/meme/${memeId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);
        console.log('✅ Meme analytics fetched:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Error fetching meme analytics:', error);
        throw error;
    }
};

// Get platform analytics (admin only)
export const getPlatformAnalytics = async (timeRange = 30) => {
    try {
        console.log('🔄 Fetching platform analytics...');
        
        const response = await fetch(`${API_BASE_URL}/analytics/platform?timeRange=${timeRange}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);
        console.log('✅ Platform analytics fetched:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Error fetching platform analytics:', error);
        throw error;
    }
};

// Analytics service object
const analyticsAPI = {
    getDashboardAnalytics,
    getMemeAnalytics,
    getPlatformAnalytics
};

export default analyticsAPI;
