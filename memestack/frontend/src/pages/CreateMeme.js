// ➕ Create Meme Page Component
// Meme creation interface

import React, { useState } from 'react';
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
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Create as CreateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMemes } from '../contexts/MemeContext';
import { uploadAPI } from '../services/api';
import MemeEditor from '../components/MemeEditor';

const CreateMeme = () => {
    const navigate = useNavigate();
    const { createMeme, loading } = useMemes();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'funny',
        tags: '',
        isPublic: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    const categories = [
        'funny', 'reaction', 'gaming', 'sports', 
        'political', 'wholesome', 'dark', 'custom'
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
        if (!imageFile) {
            setError('Please select an image first');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            console.log('📤 Uploading image for editing:', imageFile.name);
            const uploadResponse = await uploadAPI.uploadMeme(imageFile, (progress) => {
                setUploadProgress(progress);
            });

            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Failed to upload image');
            }

            console.log('✅ Image uploaded, opening editor');
            setUploadedImageUrl(uploadResponse.data.url);
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
        
        if (!formData.title) {
            console.log('❌ Title validation failed');
            setError('Title is required');
            return;
        }

        if (!imageFile) {
            console.log('❌ Image validation failed');
            setError('Please select an image');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);
        
        console.log('🚀 Starting upload process...');

        try {
            // Step 1: Upload the image first
            console.log('📤 Uploading image:', imageFile.name);
            const uploadResponse = await uploadAPI.uploadMeme(imageFile, (progress) => {
                console.log('📊 Upload progress:', progress + '%');
                setUploadProgress(progress);
            });

            console.log('✅ Upload response received:', uploadResponse);

            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Failed to upload image');
            }

            console.log('Image uploaded successfully:', uploadResponse);

            // Step 2: Create the meme with the uploaded image URL
            const memeData = {
                ...formData,
                imageUrl: uploadResponse.data.url, // Use the uploaded image URL
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                ➕ Create New Meme
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
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
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Upload Image
                                </Typography>
                                
                                <Paper
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'primary.main',
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        mb: 2,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    }}
                                    onClick={() => document.getElementById('file-input').click()}
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
                                        startIcon={<UploadIcon />}
                                        fullWidth
                                        disabled={isUploading}
                                    >
                                        Choose File
                                    </Button>
                                    {previewUrl && (
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
                        <Card>
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
                                            <MenuItem key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
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
                                        name="isPublic"
                                        value={formData.isPublic}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value }))}
                                        label="Visibility"
                                    >
                                        <MenuItem value={true}>Public</MenuItem>
                                        <MenuItem value={false}>Private</MenuItem>
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
        </Container>
    );
};

export default CreateMeme;
