// ➕ Enhanced Create Meme Page Component
// Modern meme creation interface with AI-powered tools

import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Alert,
    LinearProgress,
    useTheme,
    Stack,
    Chip,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Fade,
    Slide,
    Avatar,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Create as CreateIcon,
    PhotoLibrary as TemplateIcon,
    AutoAwesome as AIIcon,
    Preview as PreviewIcon,
    Publish as PublishIcon,
    Add as AddIcon,
    Close as CloseIcon,
    CameraAlt as CameraIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemes } from '../contexts/MemeContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { uploadAPI, templatesAPI } from '../services/api';
import MemeEditor from '../components/MemeEditor';

const CreateMeme = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode() || { mode: 'light' };
    const { createMeme, loading } = useMemes();
    const fileInputRef = useRef(null);

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'funny',
        tags: '',
        isPublic: true,
        visibility: 'public',
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Handle template parameter from URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const templateId = searchParams.get('template');
        
        if (templateId) {
            loadTemplate(templateId);
        }
    }, [location.search]);

    const loadTemplate = async (templateId) => {
        try {
            setLoadingTemplate(true);
            setError('');
            
            console.log('🔍 Loading template with ID:', templateId);
            const response = await templatesAPI.getTemplateById(templateId);
            const template = response.template;
            
            console.log('📄 Template loaded:', template);
            
            // Set the template as selected
            setSelectedTemplate(template);
            
            // Set the image URL for the editor
            const imageUrl = getImageUrl(template.imageUrl);
            console.log('🖼️ Template image URL:', imageUrl);
            
            if (!imageUrl) {
                throw new Error('Template does not have a valid image URL');
            }
            
            setPreviewUrl(imageUrl);
            setUploadedImageUrl(imageUrl);
            
            // Pre-fill form data with template information
            setFormData(prev => ({
                ...prev,
                title: template.title ? `Based on: ${template.title}` : prev.title,
                category: template.category || prev.category
            }));
            
            console.log('✅ Template loaded successfully');
            
            // Stay on the create form page - don't auto-advance to editor
            // Users can click "Edit Meme" button when they're ready
            
        } catch (error) {
            console.error('💥 Error loading template:', error);
            setError('Failed to load template. Please try again.');
        } finally {
            setLoadingTemplate(false);
        }
    };

    // Utility function to get full image URL (same as in Templates.js)
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads')) {
            const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const serverURL = baseURL.replace('/api', '');
            return `${serverURL}${imageUrl}`;
        }
        return imageUrl;
    };

    const steps = [
        {
            label: 'Choose Source',
            description: 'Upload an image or select a template',
            icon: <UploadIcon sx={{ fontSize: 28, color: currentThemeColors?.primary || 'primary.main' }} />,
        },
        {
            label: 'Edit & Design',
            description: 'Add text, effects, and customize your meme',
            icon: <PaletteIcon sx={{ fontSize: 28, color: '#ec4899' }} />,
        },
        {
            label: 'Details & Publish',
            description: 'Add title, description, and publish settings',
            icon: <PublishIcon sx={{ fontSize: 28, color: currentThemeColors?.primary || 'primary.main' }} />,
        },
    ];

    const categories = [
        { value: 'funny', label: '😂 Funny', color: '#f59e0b' },
        { value: 'reaction', label: '😮 Reaction', color: '#ef4444' },
        { value: 'political', label: '🏛️ Political', color: '#6366f1' },
        { value: 'sports', label: '⚽ Sports', color: '#10b981' },
        { value: 'tech', label: '💻 Tech', color: '#8b5cf6' },
        { value: 'gaming', label: '🎮 Gaming', color: '#ec4899' },
        { value: 'anime', label: '🦸 Anime', color: '#06b6d4' },
        { value: 'other', label: '🤷 Other', color: '#64748b' },
    ];

    const popularTemplates = [
        { id: 1, name: 'Drake Pointing', url: '/api/placeholder/300/300', category: 'reaction' },
        { id: 2, name: 'Distracted Boyfriend', url: '/api/placeholder/300/300', category: 'funny' },
        { id: 3, name: 'Two Buttons', url: '/api/placeholder/300/300', category: 'decision' },
        { id: 4, name: 'Change My Mind', url: '/api/placeholder/300/300', category: 'opinion' },
        { id: 5, name: 'Galaxy Brain', url: '/api/placeholder/300/300', category: 'smart' },
        { id: 6, name: 'This Is Fine', url: '/api/placeholder/300/300', category: 'reaction' },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setError('');
        }
    };

    const handleUploadAndEdit = async () => {
        // Check if we have either an uploaded file or a template image
        if (!imageFile && !selectedTemplate) {
            setError('Please select an image first');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            let finalImageUrl;
            
            if (selectedTemplate && !imageFile) {
                // If using template without custom upload, use template image directly
                finalImageUrl = uploadedImageUrl;
                console.log('✅ Using template image directly for editing');
            } else {
                // Upload custom image file
                console.log('📤 Uploading image for editing:', imageFile.name);
                const uploadResponse = await uploadAPI.uploadMeme(imageFile, (progress) => {
                    setUploadProgress(progress);
                });

                if (!uploadResponse.success) {
                    throw new Error(uploadResponse.message || 'Failed to upload image');
                }

                finalImageUrl = uploadResponse.data.url;
                console.log('✅ Image uploaded, opening editor');
            }
            
            setUploadedImageUrl(finalImageUrl);
            setShowEditor(true);
        } catch (error) {
            console.error('💥 Error uploading image:', error);
            setError(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSaveMeme = async (editedImageDataUrl) => {
        try {
            // Convert data URL to blob
            const response = await fetch(editedImageDataUrl);
            const blob = await response.blob();
            
            // Create file from blob
            const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Upload the edited image
            console.log('📤 Uploading edited meme...');
            const uploadResponse = await uploadAPI.uploadMeme(file);
            
            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Failed to upload edited meme');
            }

            // Create the meme with the edited image URL
            const memeData = {
                ...formData,
                imageUrl: uploadResponse.data.url,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                // Include template information if meme was created from template
                templateInfo: selectedTemplate ? {
                    templateId: selectedTemplate._id,
                    templateTitle: selectedTemplate.title,
                    templateCreator: {
                        userId: selectedTemplate.createdBy?._id || selectedTemplate.createdBy,
                        username: selectedTemplate.createdBy?.username || 'Unknown'
                    },
                    usedAt: new Date()
                } : null
            };

            console.log('🎨 Creating meme with edited image:', memeData);
            const result = await createMeme(memeData);
            
            if (result.success) {
                console.log('🎉 Meme created successfully, navigating to dashboard');
                navigate('/dashboard');
            } else {
                setError(result.error || 'Failed to create meme');
            }
        } catch (error) {
            console.error('💥 Error saving edited meme:', error);
            setError(error.message || 'Failed to save edited meme');
        }
    };

    const handleCancelEdit = () => {
        setShowEditor(false);
        setUploadedImageUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('🎯 Form submission started');
        console.log('📝 Form data:', formData);
        console.log('📁 Image file:', imageFile);
        console.log('🎨 Selected template:', selectedTemplate);
        console.log('🖼️ Current uploadedImageUrl:', uploadedImageUrl);
        
        if (!formData.title) {
            console.log('❌ Title validation failed');
            setError('Title is required');
            return;
        }

        // Check if we have either an uploaded file or a template image
        if (!imageFile && !selectedTemplate) {
            console.log('❌ Image validation failed - no file or template');
            setError('Please select an image or use a template');
            return;
        }

        // Additional validation for template usage
        if (selectedTemplate && !uploadedImageUrl) {
            console.log('❌ Template validation failed - no image URL set');
            setError('Template image not loaded properly. Please try again.');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);
        
        console.log('🚀 Starting upload process...');

        try {
            let finalImageUrl;
            
            if (selectedTemplate && !imageFile) {
                // If using template without custom upload, use template image directly
                finalImageUrl = uploadedImageUrl;
                console.log('✅ Using template image directly for meme creation');
            } else {
                // Step 1: Upload the custom image file
                console.log('📤 Uploading image:', imageFile.name);
                const uploadResponse = await uploadAPI.uploadMeme(imageFile, (progress) => {
                    console.log('📊 Upload progress:', progress + '%');
                    setUploadProgress(progress);
                });

                console.log('✅ Upload response received:', uploadResponse);

                if (!uploadResponse.success) {
                    throw new Error(uploadResponse.message || 'Failed to upload image');
                }

                finalImageUrl = uploadResponse.data.url;
                console.log('Image uploaded successfully:', uploadResponse);
            }

            // Step 2: Create the meme with the final image URL
            const memeData = {
                ...formData,
                imageUrl: finalImageUrl, // Use the final image URL (template or uploaded)
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                // Include template information if meme was created from template
                templateInfo: selectedTemplate ? {
                    templateId: selectedTemplate._id,
                    templateTitle: selectedTemplate.title,
                    templateCreator: {
                        userId: selectedTemplate.createdBy?._id || selectedTemplate.createdBy,
                        username: selectedTemplate.createdBy?.username || 'Unknown'
                    },
                    usedAt: new Date()
                } : null
            };

            // Ensure we have a valid imageUrl for the backend
            if (!memeData.imageUrl) {
                throw new Error('No image URL available for meme creation');
            }

            console.log('🎨 Creating meme with data:', memeData);
            const result = await createMeme(memeData);
            console.log('✅ Meme creation result:', result);
            
            if (result.success) {
                console.log('🎉 Meme created successfully, navigating to dashboard');
                navigate('/dashboard');
            } else {
                console.log('❌ Meme creation failed:', result.error);
                setError(result.error || 'Failed to create meme');
            }
        } catch (error) {
            console.error('💥 Error in handleSubmit:', error);
            setError(error.message || 'Failed to create meme');
        } finally {
            console.log('🏁 Upload process finished');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Show meme editor if image is uploaded
    if (showEditor && uploadedImageUrl) {
        return (
            <MemeEditor
                imageUrl={uploadedImageUrl}
                onSave={handleSaveMeme}
                onCancel={handleCancelEdit}
            />
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="lg">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Enhanced Header */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mb: 4,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                backdropFilter: 'blur(50px)',
                                WebkitBackdropFilter: 'blur(50px)',
                                border: theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: theme.palette.mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '24px',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: theme.palette.mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 50%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                                },
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography 
                                    variant="h3" 
                                    component="h1" 
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1.5
                                    }}
                                >
                                    {/* Plus Emoji - Separate for Natural Colors */}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontSize: 'inherit',
                                            filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                            '&:hover': {
                                                transform: 'scale(1.1) rotate(90deg)',
                                                transition: 'transform 0.3s ease',
                                            },
                                        }}
                                    >
                                        ➕
                                    </Box>
                                    
                                    {/* Create Your Meme Text with Gradient */}
                                    <Box
                                        component="span"
                                        sx={{
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                            // Fallback for browsers that don't support background-clip
                                            '@supports not (-webkit-background-clip: text)': {
                                                background: 'none',
                                                color: currentThemeColors?.primary || '#6366f1',
                                            },
                                        }}
                                    >
                                        Create Your Meme
                                    </Box>
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                    }}
                                >
                                Bring your ideas to life with our powerful meme creation tools
                            </Typography>
                            </Box>
                        </Paper>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: theme.palette.mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                p: 4,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: theme.palette.mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3)',
                                },
                            }}
                        >
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                background: `linear-gradient(45deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '1.8rem', md: '2.5rem' }
                            }}
                        >
                            ➕ Create New Meme
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                            Upload an image and add your creative touch to create an amazing meme!
                        </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Image Upload Section */}
                    <Box sx={{ flex: 1 }}>
                        <Card
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: theme.palette.mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: theme.palette.mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {selectedTemplate ? 'Template Loaded' : 'Upload Image'}
                                </Typography>
                                
                                {/* Template Loading Indicator */}
                                {loadingTemplate && (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <CircularProgress size={48} sx={{ mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Loading Template...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Please wait while we prepare your template
                                        </Typography>
                                    </Box>
                                )}
                                
                                {/* Template Info Display */}
                                {selectedTemplate && !loadingTemplate && (
                                    <Box sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'success.light' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <TemplateIcon color="success" />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Template: {selectedTemplate.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {selectedTemplate.description || 'Template loaded successfully!'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            📝 Fill out the meme details below, then click "Edit Meme" to add text and effects.
                                        </Typography>
                                    </Box>
                                )}
                                
                                <Paper
                                    sx={{
                                        background: theme.palette.mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.05) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%)',
                                        backdropFilter: 'blur(25px)',
                                        WebkitBackdropFilter: 'blur(25px)',
                                        border: theme.palette.mode === 'dark'
                                            ? '2px dashed rgba(255, 255, 255, 0.4)'
                                            : '2px dashed rgba(0, 0, 0, 0.3)',
                                        borderRadius: '16px',
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: selectedTemplate ? 'default' : 'pointer',
                                        mb: 2,
                                        transition: 'all 0.3s ease',
                                        opacity: loadingTemplate ? 0.5 : 1,
                                        '&:hover': {
                                            background: !selectedTemplate && theme.palette.mode === 'dark'
                                                ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                                : !selectedTemplate && 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                            border: !selectedTemplate && (theme.palette.mode === 'dark'
                                                ? '2px dashed rgba(255, 255, 255, 0.5)'
                                                : '2px dashed rgba(0, 0, 0, 0.4)'),
                                            transform: !selectedTemplate && 'translateY(-2px)',
                                        },
                                    }}
                                    onClick={!selectedTemplate && !loadingTemplate ? () => document.getElementById('file-input').click() : undefined}
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: 300,
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                            <Typography variant="h6" gutterBottom>
                                                Drop your image here or click to upload
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Supports JPEG, PNG, GIF, WebP (Max 10MB)
                                            </Typography>
                                        </>
                                    )}
                                </Paper>

                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {/* Upload Progress */}
                                {isUploading && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Uploading... {uploadProgress}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={uploadProgress} 
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        htmlFor="file-input"
                                        startIcon={<UploadIcon sx={{ color: 'inherit' }} />}
                                        fullWidth
                                        disabled={isUploading}
                                    >
                                        {selectedTemplate ? 'Replace Image' : 'Choose File'}
                                    </Button>
                                    {(previewUrl || selectedTemplate) && (
                                        <Button
                                            variant="contained"
                                            onClick={handleUploadAndEdit}
                                            disabled={isUploading}
                                            sx={{ minWidth: 120 }}
                                        >
                                            Edit Meme
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Meme Details Section */}
                    <Box sx={{ flex: 1 }}>
                        <Card
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: theme.palette.mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: theme.palette.mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Meme Details
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    required
                                />

                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    multiline
                                    rows={3}
                                />

                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        label="Category"
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label="Tags (comma separated)"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    placeholder="funny, cats, reaction"
                                    helperText="Add tags to help people discover your meme"
                                />

                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Visibility</InputLabel>
                                    <Select
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={(e) => {
                                            const visibility = e.target.value;
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                visibility,
                                                isPublic: visibility !== 'private'
                                            }));
                                        }}
                                        label="Visibility"
                                    >
                                        <MenuItem value="public">
                                            🌍 Public - Visible everywhere (gallery, feed, search)
                                        </MenuItem>
                                        <MenuItem value="followers_only">
                                            👥 Followers Only - Only visible to followers (feed + direct link)
                                        </MenuItem>
                                        <MenuItem value="gallery_only">
                                            🖼️ Gallery Only - Only visible in public gallery, not in followers' feed
                                        </MenuItem>
                                        <MenuItem value="feed_only">
                                            📱 Feed Only - Only visible in followers' feed, not in public gallery
                                        </MenuItem>
                                        <MenuItem value="unlisted">
                                            🔗 Unlisted - Accessible via direct link only
                                        </MenuItem>
                                        <MenuItem value="private">
                                            🔒 Private - Only visible to you
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={<CreateIcon />}
                                        disabled={loading.creating || isUploading}
                                        sx={{ flex: 1 }}
                                    >
                                        {isUploading ? 'Uploading...' : loading.creating ? 'Creating...' : 'Create Meme'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{ flex: 1 }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    💡 Tip: Click "Edit Meme" to add text and effects to your image!
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default CreateMeme;
