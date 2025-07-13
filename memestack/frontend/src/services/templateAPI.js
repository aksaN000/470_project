import api from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all templates
export const getTemplates = async (params = {}) => {
    try {
        const response = await api.get('/templates', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error.response?.data || { message: 'Failed to fetch templates' };
    }
};

// Get template by ID
export const getTemplateById = async (templateId) => {
    try {
        const response = await api.get(`/templates/${templateId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching template:', error);
        throw error.response?.data || { message: 'Failed to fetch template' };
    }
};

// Create new template
export const createTemplate = async (templateData) => {
    try {
        const formData = new FormData();
        
        // Add image file
        if (templateData.image) {
            formData.append('image', templateData.image);
        }
        
        // Add other fields
        formData.append('name', templateData.name);
        if (templateData.category) formData.append('category', templateData.category);
        if (templateData.description) formData.append('description', templateData.description);
        if (templateData.textAreas) formData.append('textAreas', JSON.stringify(templateData.textAreas));
        formData.append('isPublic', templateData.isPublic ? 'true' : 'false');

        const response = await api.post('/templates', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Error creating template:', error);
        throw error.response?.data || { message: 'Failed to create template' };
    }
};

// Update template
export const updateTemplate = async (templateId, templateData) => {
    try {
        const formData = new FormData();
        
        // Add image file if provided
        if (templateData.image) {
            formData.append('image', templateData.image);
        }
        
        // Add other fields
        if (templateData.name) formData.append('name', templateData.name);
        if (templateData.category) formData.append('category', templateData.category);
        if (templateData.description !== undefined) formData.append('description', templateData.description);
        if (templateData.textAreas) formData.append('textAreas', JSON.stringify(templateData.textAreas));
        if (templateData.isPublic !== undefined) formData.append('isPublic', templateData.isPublic ? 'true' : 'false');

        const response = await api.put(`/templates/${templateId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Error updating template:', error);
        throw error.response?.data || { message: 'Failed to update template' };
    }
};

// Delete template
export const deleteTemplate = async (templateId) => {
    try {
        const response = await api.delete(`/templates/${templateId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error.response?.data || { message: 'Failed to delete template' };
    }
};

// Get template categories
export const getTemplateCategories = async () => {
    try {
        const response = await api.get('/templates/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching template categories:', error);
        throw error.response?.data || { message: 'Failed to fetch template categories' };
    }
};

// Get user's templates
export const getUserTemplates = async (params = {}) => {
    try {
        const response = await api.get('/templates/my-templates', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching user templates:', error);
        throw error.response?.data || { message: 'Failed to fetch user templates' };
    }
};

export default {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateCategories,
    getUserTemplates
};
