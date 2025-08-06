// 🤝 Create Collaboration Page
// Form to create new collaborations

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
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
    StepContent
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Save as SaveIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI, memeAPI, challengesAPI, groupsAPI } from '../services/api';

const CreateCollaboration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: searchParams.get('type') || 'collaboration',
        originalMeme: '',
        challenge: '',
        group: '',
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
    const [challenges, setChallenges] = useState([]);
    const [groups, setGroups] = useState([]);
    const [availableTags, setAvailableTags] = useState([
        'funny', 'creative', 'educational', 'artistic', 'meme', 'remix',
        'challenge', 'community', 'trending', 'original'
    ]);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            // Load user's memes for remixing
            const memesResponse = await memeAPI.getMyMemes();
            console.log('🎭 Loaded memes:', memesResponse);
            setMemes(memesResponse.memes || []);

            // Load available challenges
            const challengesResponse = await challengesAPI.getChallenges({ status: 'active' });
            console.log('🏆 Loaded challenges:', challengesResponse);
            setChallenges(challengesResponse.challenges || []);

            // Load user's groups
            const groupsResponse = await groupsAPI.getUserGroups();
            console.log('👥 Loaded groups:', groupsResponse);
            setGroups(groupsResponse.groups || []);
        } catch (error) {
            console.error('Error loading options:', error);
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

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate required fields
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }

            if (formData.type === 'remix' && !formData.originalMeme) {
                throw new Error('Original meme is required for remixes');
            }

            if (formData.type === 'challenge_response' && !formData.challenge) {
                throw new Error('Challenge is required for challenge responses');
            }

            console.log('🚀 Creating collaboration with data:', formData);

            // Clean the data - remove empty strings for optional fields
            const cleanedData = {
                ...formData,
                originalMeme: formData.originalMeme || undefined,
                challenge: formData.challenge || undefined,
                group: formData.group || undefined,
                description: formData.description.trim() || undefined
            };

            console.log('🧹 Cleaned data:', cleanedData);

            // Create collaboration
            const collaboration = await collaborationsAPI.createCollaboration(cleanedData);
            
            console.log('✅ Collaboration created:', collaboration);
            setSuccess('Collaboration created successfully!');
            
            // Redirect to the new collaboration
            setTimeout(() => {
                navigate(`/collaborations/${collaboration._id}`);
            }, 1500);

        } catch (error) {
            console.error('❌ Error creating collaboration:', error);
            setError(
                error.message || 
                error.errors?.map(e => e.msg).join(', ') ||
                'Failed to create collaboration. Please check all required fields.'
            );
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
                        placeholder="Give your collaboration a catchy title"
                    />

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
                        <InputLabel>Collaboration Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Collaboration Type"
                            onChange={(e) => handleInputChange('type', e.target.value)}
                        >
                            <MenuItem value="collaboration">General Collaboration</MenuItem>
                            <MenuItem value="remix">Meme Remix</MenuItem>
                            <MenuItem value="template_creation">Template Creation</MenuItem>
                            <MenuItem value="challenge_response">Challenge Response</MenuItem>
                        </Select>
                    </FormControl>

                    <Autocomplete
                        multiple
                        freeSolo
                        options={availableTags}
                        value={formData.tags}
                        onChange={(e, newValue) => handleInputChange('tags', newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip key={index} label={option} {...getTagProps({ index })} />
                            ))
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
                                💡 For general collaborations, you can optionally select a group to collaborate within.
                            </Typography>
                        </Box>
                    )}

                    {formData.type === 'remix' && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Original Meme to Remix</InputLabel>
                            <Select
                                value={formData.originalMeme}
                                label="Original Meme to Remix"
                                onChange={(e) => handleInputChange('originalMeme', e.target.value)}
                            >
                                {memes.length === 0 ? (
                                    <MenuItem disabled>
                                        No memes available - Create some memes first!
                                    </MenuItem>
                                ) : (
                                    memes.map((meme) => (
                                        <MenuItem key={meme._id} value={meme._id}>
                                            {meme.title}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    )}

                    {formData.type === 'template_creation' && (
                        <Box sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1, mb: 2 }}>
                            <Typography variant="body2">
                                🎨 Template creation collaborations let you work together to create reusable meme templates.
                            </Typography>
                        </Box>
                    )}

                    {formData.type === 'challenge_response' && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Challenge</InputLabel>
                            <Select
                                value={formData.challenge}
                                label="Challenge"
                                onChange={(e) => handleInputChange('challenge', e.target.value)}
                            >
                                {challenges.map((challenge) => (
                                    <MenuItem key={challenge._id} value={challenge._id}>
                                        {challenge.title} ({challenge.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Group (Optional)</InputLabel>
                        <Select
                            value={formData.group}
                            label="Group (Optional)"
                            onChange={(e) => handleInputChange('group', e.target.value)}
                        >
                            <MenuItem value="">None</MenuItem>
                            {groups.map((group) => (
                                <MenuItem key={group._id} value={group._id}>
                                    {group.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                return formData.title.trim().length > 0;
            case 1:
                if (formData.type === 'remix') return formData.originalMeme;
                if (formData.type === 'challenge_response') return formData.challenge;
                return true;
            case 2:
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
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
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
