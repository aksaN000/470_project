import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid,
    IconButton,
    Switch,
    FormControlLabel,
    Alert,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Autocomplete
} from '@mui/material';
import {
    Delete,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { challengesAPI, templatesAPI } from '../services/api';

const CreateChallengeFixed = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentThemeColors } = useThemeMode();
    
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [templates, setTemplates] = useState([]);
    
    // Use refs for form inputs to avoid controlled component issues
    const endDateRef = useRef();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        endDate: '',
        maxParticipants: '100'
    });
    
    const [formState, setFormState] = useState({
        type: 'challenge',
        category: 'freestyle',
        template: null,
        isPublic: true,
        rules: [],
        prizes: [],
        votingSystem: { type: 'public' },
        judges: [],
        tags: []
    });

    const [newRule, setNewRule] = useState('');
    const [newPrize, setNewPrize] = useState({ position: 1, title: '', description: '', value: '' });

    const categories = [
        'reaction', 'mocking', 'success', 'fail', 'advice',
        'rage', 'philosoraptor', 'first_world_problems', 
        'conspiracy', 'confession', 'socially_awkward',
        'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
    ];

    const challengeTypes = [
        { value: 'challenge', label: 'Open Challenge' },
        { value: 'contest', label: 'Judged Contest' },
        { value: 'collaboration', label: 'Group Collaboration' },
        { value: 'tournament', label: 'Tournament Style' }
    ];

    const votingTypes = [
        { value: 'public', label: 'Public Voting' },
        { value: 'judges', label: 'Judge Panel' },
        { value: 'hybrid', label: 'Hybrid (Public + Judges)' }
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await templatesAPI.getTemplates();
            setTemplates(response.data || response.templates || []);
        } catch (err) {
            console.error('Failed to load templates:', err);
        }
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
            setError('');
        } else {
            setError('Please fill in all required fields for this step');
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const validateStep = (step) => {
        switch (step) {
            case 0:
                const title = formData.title?.trim();
                const description = formData.description?.trim();
                const endDate = formData.endDate;
                
                if (!title || !endDate) {
                    return false;
                }
                
                if (new Date(endDate) <= new Date()) {
                    setError('End date must be in the future');
                    return false;
                }
                
                return true;
            case 1:
                return true; // Rules are optional
            case 2:
                return true; // Prizes are optional
            case 3:
                return true; // Final review
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Use controlled form data instead of refs
            const challengeData = {
                title: formData.title,
                description: formData.description,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                maxParticipants: parseInt(formData.maxParticipants) || 100,
                ...formState
            };

            console.log('🟦 Submitting challenge data:', challengeData);
            const result = await challengesAPI.createChallenge(challengeData);
            console.log('🟩 Challenge created successfully:', result);
            setSuccess('Challenge created successfully!');
            
            setTimeout(() => {
                navigate(`/challenges/${result._id}`);
            }, 2000);
        } catch (err) {
            console.error('🟥 Challenge creation error:', err);
            setError(err.message || 'Failed to create challenge');
            setLoading(false);
        }
    };

    const updateFormState = useCallback((updates) => {
        setFormState(prev => ({ ...prev, ...updates }));
    }, []);

    const addRule = () => {
        if (newRule.trim()) {
            updateFormState({
                rules: [...formState.rules, newRule.trim()]
            });
            setNewRule('');
        }
    };

    const removeRule = (index) => {
        updateFormState({
            rules: formState.rules.filter((_, i) => i !== index)
        });
    };

    const BasicInformationStep = () => (
        <Box>
            <TextField
                fullWidth
                label="Challenge Title"
                margin="normal"
                required
                helperText="Create an engaging title for your challenge"
                autoComplete="off"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={4}
                required
                helperText="Describe what participants should create"
                autoComplete="off"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Challenge Type</InputLabel>
                        <Select
                            value={formState.type}
                            label="Challenge Type"
                            onChange={(e) => updateFormState({ type: e.target.value })}
                        >
                            {challengeTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formState.category}
                            label="Category"
                            onChange={(e) => updateFormState({ category: e.target.value })}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        inputRef={endDateRef}
                        fullWidth
                        label="End Date"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        autoComplete="off"
                    />
                </Grid>
            </Grid>

            <TextField
                fullWidth
                label="Max Participants"
                type="number"
                margin="normal"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                inputProps={{ min: 1, max: 10000 }}
                helperText="Maximum number of participants (0 for unlimited)"
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={formState.isPublic}
                        onChange={(e) => updateFormState({ isPublic: e.target.checked })}
                    />
                }
                label="Public Challenge"
            />
        </Box>
    );

    const steps = [
        {
            label: 'Basic Information',
            content: <BasicInformationStep />
        },
        {
            label: 'Rules & Guidelines',
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Challenge Rules (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Add a rule"
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addRule()}
                        />
                        <Button onClick={addRule} variant="outlined">
                            Add
                        </Button>
                    </Box>
                    <List>
                        {formState.rules.map((rule, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${index + 1}. ${rule}`} />
                                <ListItemSecondaryAction>
                                    <IconButton onClick={() => removeRule(index)}>
                                        <Delete />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )
        },
        {
            label: 'Voting & Judging',
            content: (
                <Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Voting System</InputLabel>
                        <Select
                            value={formState.votingSystem.type}
                            label="Voting System"
                            onChange={(e) => updateFormState({ 
                                votingSystem: { type: e.target.value } 
                            })}
                        >
                            {votingTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )
        },
        {
            label: 'Review & Submit',
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Review Your Challenge
                    </Typography>
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography><strong>Title:</strong> {formData.title || 'Not set'}</Typography>
                        <Typography><strong>Description:</strong> {formData.description || 'Not set'}</Typography>
                        <Typography><strong>Type:</strong> {formState.type}</Typography>
                        <Typography><strong>Category:</strong> {formState.category}</Typography>
                        <Typography><strong>End Date:</strong> {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not set'}</Typography>
                        <Typography><strong>Max Participants:</strong> {formData.maxParticipants || '100'}</Typography>
                        <Typography><strong>Public:</strong> {formState.isPublic ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Rules:</strong> {formState.rules.length} rules added</Typography>
                    </Paper>
                </Box>
            )
        }
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/challenges')} sx={{ mr: 2 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Create Challenge (Fixed Version)
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>
                            {step.label}
                        </StepLabel>
                        <StepContent>
                            {step.content}
                            <Box sx={{ mb: 2, mt: 2 }}>
                                <div>
                                    {activeStep === steps.length - 1 ? (
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            {loading ? 'Creating...' : 'Create Challenge'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            Continue
                                        </Button>
                                    )}
                                    <Button
                                        disabled={index === 0}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Container>
    );
};

export default CreateChallengeFixed;
