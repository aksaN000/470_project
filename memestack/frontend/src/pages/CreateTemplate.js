// 🎨 Create Template Page Component
// Allow users to create new meme templates

import React, { useState, useRef } from 'react';
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
    Grid,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade,
    Zoom,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Create as CreateIcon,
    Palette as PaletteIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Preview as PreviewIcon,
    TextFields as TextIcon,
    Close as CloseIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { templatesAPI } from '../services/api';

const CreateTemplate = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'popular',
        isPublic: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
    const [textAreas, setTextAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showTextAreaDialog, setShowTextAreaDialog] = useState(false);
    const [newTextArea, setNewTextArea] = useState({
        id: '',
        defaultText: '',
        x: 50,  // Percentage from left
        y: 50,  // Percentage from top
        width: 80,  // Percentage width
        height: 15, // Percentage height
        fontSize: 36,
        fontFamily: 'Impact',
        fontColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        textAlign: 'center',
        verticalAlign: 'middle'
    });

    const categories = [
        'reaction', 'mocking', 'success', 'fail', 'advice',
        'rage', 'philosoraptor', 'first_world_problems', 
        'conspiracy', 'confession', 'socially_awkward',
        'good_guy', 'scumbag', 'popular', 'classic'
    ];

    const fontOptions = ['Impact', 'Arial', 'Helvetica', 'Times New Roman', 'Comic Sans MS'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be less than 10MB');
                return;
            }
            
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                setImageDimensions({
                    width: img.width,
                    height: img.height
                });
            };
            img.src = url;
            
            setError('');
        }
    };

    const handleAddTextArea = () => {
        const id = `text${textAreas.length + 1}`;
        setNewTextArea(prev => ({ ...prev, id }));
        setShowTextAreaDialog(true);
    };

    const handleSaveTextArea = () => {
        if (!newTextArea.defaultText) {
            setError('Text area must have default text');
            return;
        }

        setTextAreas(prev => [...prev, { ...newTextArea }]);
        setNewTextArea({
            id: '',
            defaultText: '',
            x: 50,  // Percentage from left
            y: 50,  // Percentage from top
            width: 80,  // Percentage width
            height: 15, // Percentage height
            fontSize: 36,
            fontFamily: 'Impact',
            fontColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 2,
            textAlign: 'center',
            verticalAlign: 'middle'
        });
        setShowTextAreaDialog(false);
        setError('');
    };

    const handleRemoveTextArea = (index) => {
        setTextAreas(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name) {
            setError('Template name is required');
            return;
        }

        if (!imageFile) {
            setError('Template image is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const templateData = {
                ...formData,
                image: imageFile,
                textAreas: textAreas,
                dimensions: imageDimensions  // Add image dimensions
            };

            const response = await templatesAPI.createTemplate(templateData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/templates');
                }, 2000);
            } else {
                setError(response.message || 'Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
            setError(error.message || 'Failed to create template');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(30, 41, 59, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                        boxShadow: theme.palette.mode === 'light' 
                            ? '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                            : '0 25px 50px -12px rgb(0 0 0 / 0.6)',
                    }}
                >
                    <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Template Created Successfully!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Your template is now available in the template gallery.
                    </Typography>
                </Paper>
            </Box>
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
                        {/* Header */}
                        <Zoom in={true} timeout={1200}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
                                    background: theme.palette.mode === 'dark'
                                        ? 'rgba(30, 41, 59, 0.95)'
                                        : 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '24px',
                                    border: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.2)'
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                    textAlign: 'center',
                                    boxShadow: theme.palette.mode === 'light' 
                                        ? '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        : '0 20px 25px -5px rgb(0 0 0 / 0.4)',
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <PaletteIcon sx={{ fontSize: 'inherit', color: currentThemeColors?.primary }} />
                                    <Box
                                        component="span"
                                        sx={{
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                        }}
                                    >
                                        Create Template
                                    </Box>
                                </Typography>
                                <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                                    Share your creativity by creating reusable meme templates
                                </Typography>
                            </Paper>
                        </Zoom>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Main Form */}
                        <Paper
                            elevation={0}
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                p: 4,
                                background: theme.palette.mode === 'dark'
                                    ? 'rgba(30, 41, 59, 0.95)'
                                    : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                border: theme.palette.mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.2)'
                                    : '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: theme.palette.mode === 'light' 
                                    ? '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    : '0 20px 25px -5px rgb(0 0 0 / 0.4)',
                            }}
                        >
                            <Grid container spacing={4}>
                                {/* Template Details */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                                        Template Details
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Template Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        sx={{ mb: 3 }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        sx={{ mb: 3 }}
                                    />

                                    <FormControl fullWidth sx={{ mb: 3 }}>
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

                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>Visibility</InputLabel>
                                        <Select
                                            name="isPublic"
                                            value={formData.isPublic}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value }))}
                                            label="Visibility"
                                        >
                                            <MenuItem value={true}>🌍 Public - Everyone can use this template</MenuItem>
                                            <MenuItem value={false}>🔒 Private - Only you can use this template</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Image Upload */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                                        Template Image
                                    </Typography>

                                    <Paper
                                        sx={{
                                            p: 3,
                                            mb: 3,
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                            border: theme.palette.mode === 'dark'
                                                ? '2px dashed rgba(255, 255, 255, 0.4)'
                                                : '2px dashed rgba(0, 0, 0, 0.3)',
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
                                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Template Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: 300,
                                                    objectFit: 'contain',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                                <Typography variant="h6" gutterBottom>
                                                    Click to upload template image
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Supports JPEG, PNG, GIF (Max 10MB)
                                                </Typography>
                                            </>
                                        )}
                                    </Paper>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => fileInputRef.current?.click()}
                                        startIcon={<UploadIcon />}
                                    >
                                        {imageFile ? 'Change Image' : 'Choose Image'}
                                    </Button>

                                    {/* Image Dimensions */}
                                    {imageFile && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                Image Dimensions
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Width (px)"
                                                        type="number"
                                                        value={imageDimensions.width}
                                                        onChange={(e) => setImageDimensions(prev => ({ 
                                                            ...prev, 
                                                            width: parseInt(e.target.value) || 800 
                                                        }))}
                                                        InputProps={{ readOnly: false }}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Height (px)"
                                                        type="number"
                                                        value={imageDimensions.height}
                                                        onChange={(e) => setImageDimensions(prev => ({ 
                                                            ...prev, 
                                                            height: parseInt(e.target.value) || 600 
                                                        }))}
                                                        InputProps={{ readOnly: false }}
                                                        size="small"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                Detected from uploaded image. You can modify these values.
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>

                                {/* Text Areas Configuration */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            Text Areas (Optional)
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddTextArea}
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                            }}
                                        >
                                            Add Text Area
                                        </Button>
                                    </Box>

                                    {textAreas.length === 0 ? (
                                        <Paper sx={{ 
                                            p: 3, 
                                            textAlign: 'center', 
                                            background: theme.palette.mode === 'dark'
                                                ? 'rgba(30, 41, 59, 0.95)'
                                                : 'rgba(248, 250, 252, 0.95)',
                                            border: theme.palette.mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.2)'
                                                : '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: 2
                                        }}>
                                            <TextIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                No text areas configured. Add text areas to define where users can place text on your template.
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {textAreas.map((textArea, index) => (
                                                <Grid item xs={12} sm={6} key={index}>
                                                    <Card
                                                        sx={{
                                                            background: theme.palette.mode === 'dark'
                                                                ? 'rgba(255, 255, 255, 0.05)'
                                                                : 'rgba(255, 255, 255, 0.8)',
                                                            backdropFilter: 'blur(10px)',
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                    {textArea.id}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveTextArea(index)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                Text: "{textArea.defaultText}"
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                Position: {textArea.x}%, {textArea.y}%
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Font: {textArea.fontFamily} ({textArea.fontSize}px)
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={() => navigate('/templates')}
                                            sx={{ px: 4 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            startIcon={loading ? null : <SaveIcon />}
                                            disabled={loading || !formData.name || !imageFile}
                                            sx={{
                                                px: 4,
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <LinearProgress sx={{ width: 20, mr: 1 }} />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Template'
                                            )}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Text Area Configuration Dialog */}
                        <Dialog
                            open={showTextAreaDialog}
                            onClose={() => setShowTextAreaDialog(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle>Configure Text Area</DialogTitle>
                            <DialogContent>
                                <TextField
                                    fullWidth
                                    label="Default Text"
                                    value={newTextArea.defaultText}
                                    onChange={(e) => setNewTextArea(prev => ({ ...prev, defaultText: e.target.value }))}
                                    sx={{ mb: 2, mt: 1 }}
                                />
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="X Position (%)"
                                            type="number"
                                            value={newTextArea.x}
                                            onChange={(e) => setNewTextArea(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Y Position (%)"
                                            type="number"
                                            value={newTextArea.y}
                                            onChange={(e) => setNewTextArea(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Font Size"
                                            type="number"
                                            value={newTextArea.fontSize}
                                            onChange={(e) => setNewTextArea(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 36 }))}
                                            inputProps={{ min: 8, max: 72 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Font Family</InputLabel>
                                            <Select
                                                value={newTextArea.fontFamily}
                                                onChange={(e) => setNewTextArea(prev => ({ ...prev, fontFamily: e.target.value }))}
                                                label="Font Family"
                                            >
                                                {fontOptions.map((font) => (
                                                    <MenuItem key={font} value={font}>{font}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowTextAreaDialog(false)}>Cancel</Button>
                                <Button onClick={handleSaveTextArea} variant="contained">Add Text Area</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default CreateTemplate;
