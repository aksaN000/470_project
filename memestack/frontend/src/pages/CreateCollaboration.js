// 🤝 Create Collaboration Page
// Form to create new collaborations

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Chip,
    Paper,
    Fade,
    useTheme,
    Alert,
    CircularProgress,
    Autocomplete,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Grid
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Save as SaveIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI, memeAPI } from '../services/api';

const CreateCollaboration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: searchParams.get('type') || 'collaboration',
        originalMeme: '',
        settings: {
            isPublic: true,
            allowForks: true,
            requireApproval: false,
            maxCollaborators: 10,
            allowAnonymous: false,
            deadline: ''
        },
        tags: []
    });

    // Available options
    const [memes, setMemes] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [availableTags, setAvailableTags] = useState([
        'funny', 'creative', 'educational', 'artistic', 'meme', 'remix',
        'community', 'trending', 'original'
    ]);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            setLoadingOptions(true);
            console.log('Loading options for collaboration...');
            
            // Load user's memes for remixing
            const memesResponse = await memeAPI.getMyMemes();
            console.log('Memes API response:', memesResponse);
            
            // Fix: Access the correct nested structure - try multiple possible structures
            const memesList = memesResponse.data?.memes || 
                             memesResponse.memes || 
                             memesResponse.data || 
                             (Array.isArray(memesResponse) ? memesResponse : []);
            
            console.log('Processed memes list:', memesList);
            console.log('Sample meme object:', memesList[0]);
            
            // Normalize meme objects to ensure they have proper IDs
            const normalizedMemes = memesList.map((meme, index) => {
                if (!meme) return null;
                
                // Handle different possible ID field names - backend returns 'id', not '_id'
                const memeId = meme._id || meme.id || meme.memeId || `temp-id-${index}`;
                
                return {
                    ...meme,
                    _id: memeId, // Normalize to _id for consistency in frontend
                    id: memeId,
                    title: meme.title || meme.name || 'Untitled Meme',
                    imageUrl: meme.imageUrl || meme.image || meme.url
                };
            }).filter(Boolean);
            
            console.log('Normalized memes:', normalizedMemes);
            setMemes(normalizedMemes);

            // Load collaboration templates
            try {
                const templatesResponse = await collaborationsAPI.getTemplates();
                setTemplates(templatesResponse || []);
                console.log('Loaded templates:', templatesResponse);
            } catch (templateError) {
                console.warn('Could not load templates:', templateError);
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error loading options:', error);
            setError('Failed to load collaboration options. Please try refreshing the page.');
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const applyTemplate = (template) => {
        if (!template) return;
        
        setFormData(prev => ({
            ...prev,
            title: template.name || prev.title,
            description: template.description || prev.description,
            type: template.type || prev.type,
            visibility: template.visibility || prev.visibility,
            maxParticipants: template.maxParticipants || prev.maxParticipants,
            timeline: template.timeline || prev.timeline,
            tags: template.tags || prev.tags,
            guidelines: template.guidelines || prev.guidelines,
            workflow: template.workflow || prev.workflow
        }));
        
        setSelectedTemplate(template);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate required fields
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }
            
            if (formData.title.trim().length < 3) {
                throw new Error('Title must be at least 3 characters long');
            }
            
            if (formData.title.trim().length > 200) {
                throw new Error('Title cannot exceed 200 characters');
            }

            if (formData.type === 'remix' && !formData.originalMeme) {
                throw new Error('Original meme is required for remixes');
            }

            // Clean the data - remove empty strings for optional fields
            const cleanedData = {
                ...formData,
                originalMeme: formData.originalMeme || undefined,
                description: formData.description.trim() || undefined,
                templateUsed: selectedTemplate?._id || undefined
            };

            // Remove undefined values to avoid sending them to the API
            Object.keys(cleanedData).forEach(key => {
                if (cleanedData[key] === undefined) {
                    delete cleanedData[key];
                }
            });

            console.log('Data being sent to API:', cleanedData);
            console.log('Original meme ID type:', typeof cleanedData.originalMeme);
            console.log('Original meme ID value:', cleanedData.originalMeme);
            console.log('Original meme ID length:', cleanedData.originalMeme?.length);
            console.log('Settings:', cleanedData.settings);

            // Validate ObjectId format before sending (24 character hex string)
            if (cleanedData.originalMeme && !/^[0-9a-fA-F]{24}$/.test(cleanedData.originalMeme)) {
                throw new Error(`Invalid meme ID format: ${cleanedData.originalMeme}. Must be a 24-character hexadecimal string.`);
            }

            // Create collaboration
            const collaboration = await collaborationsAPI.createCollaboration(cleanedData);
            
            setSuccess('Collaboration created successfully!');
            
            // Clear form data
            setFormData({
                title: '',
                description: '',
                type: searchParams.get('type') || 'collaboration',
                originalMeme: '',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: false,
                    maxCollaborators: 10,
                    allowAnonymous: false,
                    deadline: ''
                },
                tags: []
            });
            
            // Redirect to the new collaboration
            setTimeout(() => {
                navigate(`/collaborations/${collaboration._id}`);
            }, 1500);

        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            let errorMessage = 'Failed to create collaboration. Please check all required fields.';
            
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.errors) {
                    if (Array.isArray(error.response.data.errors)) {
                        // Handle express-validator errors
                        const validationErrors = error.response.data.errors.map(e => e.msg || e.message || e).join(', ');
                        errorMessage = `Validation failed: ${validationErrors}`;
                    } else {
                        errorMessage = JSON.stringify(error.response.data.errors);
                    }
                } else {
                    // Try to extract any error message from the data object
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.error('Final error message:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            label: 'Basic Information',
            content: (
                <Box>
                    <TextField
                        fullWidth
                        label="Collaboration Title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        margin="normal"
                        required
                        placeholder="Give your collaboration a catchy title (3-200 characters)"
                        helperText={`${formData.title.length}/200 characters (minimum 3)`}
                        error={formData.title.length > 0 && formData.title.length < 3}
                    />

                    {/* Template Selection */}
                    {templates.length > 0 && (
                        <Box sx={{ my: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Use a Template (Optional)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Start with a pre-configured template to save time
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {templates.map((template) => (
                                    <Grid item xs={12} sm={6} md={4} key={template._id}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                border: selectedTemplate?._id === template._id ? 2 : 1,
                                                borderColor: selectedTemplate?._id === template._id ? 'primary.main' : 'divider',
                                                '&:hover': {
                                                    boxShadow: 2
                                                }
                                            }}
                                            onClick={() => applyTemplate(template)}
                                        >
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {template.description}
                                                </Typography>
                                                <Chip
                                                    label={template.type}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                {template.tags && (
                                                    <Box sx={{ mt: 1 }}>
                                                        {template.tags.slice(0, 3).map((tag) => (
                                                            <Chip
                                                                key={tag}
                                                                label={tag}
                                                                size="small"
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                
                                {/* Clear Template Option */}
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelectedTemplate(null)}
                                        disabled={!selectedTemplate}
                                        sx={{ mt: 1 }}
                                    >
                                        Clear Template
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        margin="normal"
                        placeholder="Describe what this collaboration is about and what you hope to achieve"
                    />

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="collaboration-type-label">Collaboration Type</InputLabel>
                        <Select
                            labelId="collaboration-type-label"
                            value={formData.type || ''}
                            label="Collaboration Type"
                            onChange={(e) => handleInputChange('type', e.target.value || '')}
                        >
                            <MenuItem value="collaboration">General Collaboration</MenuItem>
                            <MenuItem value="remix">Meme Remix</MenuItem>
                            <MenuItem value="template_creation">Template Creation</MenuItem>
                        </Select>
                    </FormControl>

                    <Autocomplete
                        multiple
                        freeSolo
                        options={availableTags}
                        value={formData.tags}
                        onChange={(e, newValue) => handleInputChange('tags', newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const tagProps = getTagProps({ index });
                                const { key, ...otherProps } = tagProps;
                                return (
                                    <Chip 
                                        key={`tag-${index}-${option}`}
                                        label={option} 
                                        {...otherProps} 
                                    />
                                );
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Add tags to help others find your collaboration"
                                margin="normal"
                            />
                        )}
                    />
                </Box>
            )
        },
        {
            label: 'Source Content',
            content: (
                <Box>
                    {formData.type === 'collaboration' && (
                        <Box sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1, mb: 2 }}>
                            <Typography variant="body2">
                                💡 General collaborations allow you to work together on meme creation projects.
                            </Typography>
                        </Box>
                    )}

                    {formData.type === 'remix' && (
                        <Box>
                            {/* Info about meme selection */}
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    🎭 <strong>Remix Collaboration:</strong> Choose one of your own memes as the starting point. 
                                    Other collaborators will be able to create variations and improvements based on your original.
                                </Typography>
                            </Alert>
                            
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel id="original-meme-label">
                                    Original Meme to Remix
                                </InputLabel>
                                <Select
                                    labelId="original-meme-label"
                                    value={formData.originalMeme || ''}
                                    label="Original Meme to Remix"
                                    onChange={(e) => {
                                        const selectedValue = e.target.value || '';
                                        console.log('Meme selected:', selectedValue);
                                        console.log('Available memes:', memes);
                                        
                                        setFormData(prev => {
                                            const newData = {
                                                ...prev,
                                                originalMeme: selectedValue
                                            };
                                            console.log('Updated form data:', newData);
                                            return newData;
                                        });
                                    }}
                                    disabled={loadingOptions}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected || selected === '') {
                                            return <em>Select a meme to remix</em>;
                                        }
                                        const selectedMeme = memes.find(m => m._id === selected);
                                        console.log('Rendering value for:', selected, selectedMeme);
                                        return (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {selectedMeme && selectedMeme.imageUrl && (
                                                    <img 
                                                        src={selectedMeme.imageUrl} 
                                                        alt={selectedMeme.title || 'Meme'}
                                                        style={{ 
                                                            width: 24, 
                                                            height: 24, 
                                                            objectFit: 'cover',
                                                            borderRadius: 4
                                                        }}
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', selectedMeme.imageUrl);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <span>{selectedMeme ? (selectedMeme.title || 'Untitled Meme') : 'Unknown meme'}</span>
                                            </Box>
                                        );
                                    }}
                                >
                                    {loadingOptions ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Loading your memes...
                                        </MenuItem>
                                    ) : memes.length === 0 ? (
                                        <MenuItem disabled value="">
                                            No memes available - Create some memes first!
                                        </MenuItem>
                                    ) : (
                                        memes.map((meme) => {
                                            if (!meme || !meme._id) {
                                                console.warn('Invalid meme object:', meme);
                                                return null;
                                            }
                                            return (
                                                <MenuItem 
                                                    key={meme._id} 
                                                    value={meme._id}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1} width="100%">
                                                        {meme.imageUrl && (
                                                            <img 
                                                                src={meme.imageUrl} 
                                                                alt={meme.title || 'Meme'}
                                                                style={{ 
                                                                    width: 40, 
                                                                    height: 40, 
                                                                    objectFit: 'cover',
                                                                    borderRadius: 4,
                                                                    flexShrink: 0
                                                                }}
                                                                onError={(e) => {
                                                                    console.error('Image failed to load:', meme.imageUrl);
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography variant="body2" noWrap>
                                                                {meme.title || 'Untitled Meme'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                                {meme.description || 'No description'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            );
                                        }).filter(Boolean)
                                    )}
                                </Select>
                            </FormControl>
                            
                            {/* Show currently selected meme */}
                            {formData.originalMeme && (
                                <Box sx={{ mt: 1, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        {(() => {
                                            const selectedMeme = memes.find(m => m._id === formData.originalMeme);
                                            return selectedMeme ? (
                                                <>
                                                    <img 
                                                        src={selectedMeme.imageUrl} 
                                                        alt={selectedMeme.title}
                                                        style={{ 
                                                            width: 30, 
                                                            height: 30, 
                                                            objectFit: 'cover',
                                                            borderRadius: 4
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                                                        ✅ Selected: {selectedMeme.title || 'Untitled Meme'}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                                                    ✅ Selected: Unknown meme
                                                </Typography>
                                            );
                                        })()}
                                    </Box>
                                    <Typography variant="caption" color="success.dark">
                                        ID: {formData.originalMeme}
                                    </Typography>
                                </Box>
                            )}
                            
                            {/* Debug info for development */}
                            {process.env.NODE_ENV === 'development' && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                    <Typography variant="caption" component="div">
                                        Debug Info:
                                    </Typography>
                                    <Typography variant="caption" component="div">
                                        - Memes loaded: {memes.length}
                                    </Typography>
                                    <Typography variant="caption" component="div">
                                        - Loading: {loadingOptions ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="caption" component="div">
                                        - Selected meme ID: {formData.originalMeme || 'None'}
                                    </Typography>
                                    {memes.length > 0 && (
                                        <>
                                            <Typography variant="caption" component="div">
                                                - First meme ID: {memes[0]?._id || 'Missing'}
                                            </Typography>
                                            <Typography variant="caption" component="div">
                                                - First meme title: {memes[0]?.title || 'Missing'}
                                            </Typography>
                                            <Typography variant="caption" component="div">
                                                - First meme raw: {JSON.stringify(memes[0], null, 2)}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            )}
                            
                            {/* Helper Actions Outside Select */}
                            {memes.length === 0 && !loadingOptions && (
                                <Box display="flex" gap={1} mt={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => window.open('/meme-editor', '_blank')}
                                        startIcon="🎨"
                                    >
                                        Create a new meme
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => loadOptions()}
                                        startIcon="🔄"
                                    >
                                        Refresh meme list
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}

                    {formData.type === 'template_creation' && (
                        <Box sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1, mb: 2 }}>
                            <Typography variant="body2">
                                🎨 Template creation collaborations let you work together to create reusable meme templates.
                            </Typography>
                        </Box>
                    )}

                </Box>
            )
        },
        {
            label: 'Settings',
            content: (
                <Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.settings.isPublic}
                                onChange={(e) => handleInputChange('settings.isPublic', e.target.checked)}
                            />
                        }
                        label="Public Collaboration"
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                        Public collaborations can be discovered and joined by anyone
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.settings.allowForks}
                                onChange={(e) => handleInputChange('settings.allowForks', e.target.checked)}
                            />
                        }
                        label="Allow Forks"
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                        Others can create their own version based on this collaboration
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.settings.requireApproval}
                                onChange={(e) => handleInputChange('settings.requireApproval', e.target.checked)}
                            />
                        }
                        label="Require Approval"
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                        New contributors need approval before joining
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.settings.allowAnonymous}
                                onChange={(e) => handleInputChange('settings.allowAnonymous', e.target.checked)}
                            />
                        }
                        label="Allow Anonymous Contributions"
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                        Allow contributions without requiring login
                    </Typography>

                    <TextField
                        fullWidth
                        type="number"
                        label="Maximum Collaborators"
                        value={formData.settings.maxCollaborators}
                        onChange={(e) => handleInputChange('settings.maxCollaborators', parseInt(e.target.value))}
                        margin="normal"
                        inputProps={{ min: 2, max: 50 }}
                    />

                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Deadline (Optional)"
                        value={formData.settings.deadline}
                        onChange={(e) => handleInputChange('settings.deadline', e.target.value)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            )
        }
    ];

    const isStepValid = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                // Basic Information - require title with proper length
                return formData.title && 
                       formData.title.trim().length >= 3 && 
                       formData.title.trim().length <= 200;
            case 1:
                // Source Content - validate based on collaboration type
                if (formData.type === 'remix') {
                    const isValid = formData.originalMeme && formData.originalMeme.trim() !== '';
                    console.log('Remix validation:', { 
                        originalMeme: formData.originalMeme, 
                        isValid,
                        memesAvailable: memes.length 
                    });
                    return isValid;
                }
                // For other types, this step is always valid
                return true;
            case 2:
                // Settings - always valid (all settings have defaults)
                return true;
            default:
                return false;
        }
    };

    if (!user) {
        return (
            <Container>
                <Alert severity="error">
                    You must be logged in to create a collaboration.
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4
        }}>
            <Fade in timeout={800}>
                <Container maxWidth="md">
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                                {success}
                            </Alert>
                        )}

                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                            backdropFilter: 'blur(50px)',
                            borderRadius: 3,
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.15)'
                                : '2px solid rgba(99, 102, 241, 0.15)',
                            p: 4
                        }}
                    >
                        <Box display="flex" alignItems="center" mb={4}>
                            <Button
                                startIcon={<BackIcon />}
                                onClick={() => navigate('/collaborations')}
                                sx={{ mr: 2 }}
                            >
                                Back
                            </Button>
                            <Typography variant="h4" component="h1">
                                Create New Collaboration
                            </Typography>
                        </Box>

                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((step, index) => (
                                <Step key={step.label}>
                                    <StepLabel>{step.label}</StepLabel>
                                    <StepContent>
                                        <Card sx={{ mt: 2, mb: 2 }}>
                                            <CardContent>
                                                {step.content}
                                            </CardContent>
                                        </Card>
                                        
                                        <Box sx={{ mb: 2 }}>
                                            <div>
                                                {index === steps.length - 1 ? (
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleSubmit}
                                                        disabled={!isStepValid(index) || loading}
                                                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {loading ? 'Creating...' : 'Create Collaboration'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => setActiveStep(prev => prev + 1)}
                                                        disabled={!isStepValid(index)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Continue
                                                    </Button>
                                                )}
                                                
                                                {index > 0 && (
                                                    <Button
                                                        onClick={() => setActiveStep(prev => prev - 1)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Back
                                                    </Button>
                                                )}
                                            </div>
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>

                        {activeStep === steps.length && (
                            <Paper square elevation={0} sx={{ p: 3 }}>
                                <Typography>All steps completed - you're finished!</Typography>
                                <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
                                    Reset
                                </Button>
                            </Paper>
                        )}
                    </Paper>
                </Container>
            </Fade>
        </Box>
    );
};

export default CreateCollaboration;
