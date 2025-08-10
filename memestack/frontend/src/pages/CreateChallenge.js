// 🏆 Create Challenge Component
// Form for creating new meme challenges

import React, { useState, useEffect, useCallback } from 'react';
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
    Chip,
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
    Fade,
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

const CreateChallenge = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentThemeColors } = useThemeMode();
    
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [templates, setTemplates] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'challenge',
        category: 'freestyle',
        template: null,
        rules: [],
        endDate: '',
        maxParticipants: 100,
        isPublic: true,
        prizes: [],
        votingSystem: { type: 'public' },
        judges: [],
        tags: []
    });

    const [newRule, setNewRule] = useState('');
    const [newPrize, setNewPrize] = useState({ position: 1, title: '', description: '', value: '' });
    const [newTag, setNewTag] = useState('');

    const categories = [
        'reaction', 'mocking', 'success', 'fail', 'advice',
        'rage', 'philosoraptor', 'first_world_problems', 
        'conspiracy', 'confession', 'socially_awkward',
        'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
    ];

    const challengeTypes = [
        { value: 'contest', label: 'Contest', description: 'Competitive challenge with winners' },
        { value: 'challenge', label: 'Challenge', description: 'Fun challenge for community participation' },
        { value: 'collaboration', label: 'Collaboration', description: 'Work together on meme creation' }
    ];

    const votingTypes = [
        { value: 'public', label: 'Public Voting', description: 'Everyone can vote' },
        { value: 'jury', label: 'Jury Voting', description: 'Selected judges vote' }
    ];

    const steps = [
        'Basic Information',
        'Challenge Rules',
        'Prizes & Voting',
        'Review & Publish'
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await templatesAPI.getTemplates();
            setTemplates(response.templates || []);
        } catch (err) {
            console.error('Failed to load templates:', err);
        }
    };

    const handleInputChange = useCallback((field, value) => {
        console.log(`🟦 Updating field '${field}' with value:`, value);
        setFormData(prevData => {
            const newData = {
                ...prevData,
                [field]: value
            };
            console.log('🟦 New form data:', newData);
            return newData;
        });
    }, []);

    const addRule = () => {
        if (newRule.trim()) {
            setFormData(prev => ({
                ...prev,
                rules: [...prev.rules, newRule.trim()]
            }));
            setNewRule('');
        }
    };

    const removeRule = (index) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const addPrize = () => {
        if (newPrize.title.trim()) {
            setFormData(prev => ({
                ...prev,
                prizes: [...prev.prizes, { ...newPrize }]
            }));
            setNewPrize(prev => ({ 
                position: formData.prizes.length + 2, 
                title: '', 
                description: '', 
                value: '' 
            }));
        }
    };

    const removePrize = (index) => {
        setFormData(prev => ({
            ...prev,
            prizes: prev.prizes.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleNext = () => {
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const validateStep = (step) => {
        console.log(`🟦 Validating step ${step}`, formData);
        switch (step) {
            case 0:
                const basicValid = formData.title?.trim() && 
                                 formData.description?.trim() && 
                                 formData.endDate &&
                                 new Date(formData.endDate) > new Date();
                console.log(`🟦 Basic validation result:`, basicValid);
                return basicValid;
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

            // Final validation before submission
            if (!formData.title?.trim()) {
                throw new Error('Challenge title is required');
            }
            if (!formData.description?.trim()) {
                throw new Error('Challenge description is required');
            }
            if (!formData.endDate) {
                throw new Error('End date is required');
            }
            if (new Date(formData.endDate) <= new Date()) {
                throw new Error('End date must be in the future');
            }

            const challengeData = {
                ...formData,
                endDate: new Date(formData.endDate).toISOString()
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

    const BasicInformationStep = () => (
        <Box>
            <TextField
                key="challenge-title"
                fullWidth
                label="Challenge Title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                required
                helperText="Create an engaging title for your challenge"
                autoComplete="off"
            />
            
            <TextField
                key="challenge-description"
                fullWidth
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={4}
                required
                helperText="Describe what participants should create"
                autoComplete="off"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Challenge Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Challenge Type"
                            onChange={(e) => handleInputChange('type', e.target.value)}
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
                            value={formData.category}
                            label="Category"
                            onChange={(e) => handleInputChange('category', e.target.value)}
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
                        key="challenge-end-date"
                        fullWidth
                        label="End Date"
                        type="datetime-local"
                        value={formData.endDate || ''}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        autoComplete="off"
                    />
                </Grid>
            </Grid>

            <TextField
                key="challenge-max-participants"
                fullWidth
                label="Max Participants"
                type="number"
                value={formData.maxParticipants || 100}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 100)}
                margin="normal"
                autoComplete="off"
                inputProps={{ min: 2, max: 1000 }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    />
                }
                label="Public Challenge"
                sx={{ mt: 2 }}
            />

            {templates.length > 0 && (
                <Autocomplete
                    options={templates}
                    getOptionLabel={(option) => option.name}
                    value={formData.template}
                    onChange={(event, newValue) => handleInputChange('template', newValue?._id || null)}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Meme Template (Optional)" 
                            margin="normal"
                            helperText="Choose a specific template for participants to use"
                        />
                    )}
                />
            )}
        </Box>
    );

    const RulesStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Challenge Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set clear guidelines for participants. Rules help ensure fair and fun competition.
            </Typography>

            <Box display="flex" gap={1} mb={2}>
                <TextField
                    fullWidth
                    label="Add Rule"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRule()}
                    placeholder="e.g., Keep it family-friendly"
                />
                <Button 
                    variant="contained" 
                    onClick={addRule}
                    disabled={!newRule.trim()}
                >
                    Add
                </Button>
            </Box>

            <List>
                {formData.rules.map((rule, index) => (
                    <ListItem key={index} divider>
                        <ListItemText primary={`${index + 1}. ${rule}`} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => removeRule(index)} color="error">
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            {formData.rules.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No rules added yet. Add some guidelines for participants.
                </Typography>
            )}

            <Box mt={3}>
                <TextField
                    fullWidth
                    label="Tags (Optional)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    helperText="Add tags to help people discover your challenge"
                />
                <Box mt={1}>
                    {formData.tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => removeTag(tag)}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );

    const PrizesVotingStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Prizes & Voting
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Voting System</InputLabel>
                <Select
                    value={formData.votingSystem.type}
                    label="Voting System"
                    onChange={(e) => handleInputChange('votingSystem', { type: e.target.value })}
                >
                    {votingTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            <Box>
                                <Typography variant="body1">{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {type.description}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Prizes (Optional)
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Position"
                        type="number"
                        value={newPrize.position}
                        onChange={(e) => setNewPrize(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                        inputProps={{ min: 1 }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="Prize Title"
                        value={newPrize.title}
                        onChange={(e) => setNewPrize(prev => ({ ...prev, title: e.target.value }))}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Value"
                        value={newPrize.value}
                        onChange={(e) => setNewPrize(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="$100, Trophy, etc."
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={addPrize}
                        disabled={!newPrize.title.trim()}
                        sx={{ height: '56px' }}
                    >
                        Add
                    </Button>
                </Grid>
            </Grid>

            <TextField
                fullWidth
                label="Prize Description"
                value={newPrize.description}
                onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
                sx={{ mb: 3 }}
            />

            <List>
                {formData.prizes.map((prize, index) => (
                    <ListItem key={index} divider>
                        <ListItemText 
                            primary={`${prize.position}. ${prize.title}`}
                            secondary={`${prize.value} - ${prize.description}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => removePrize(index)} color="error">
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            {formData.prizes.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No prizes added yet. Add some incentives for participants!
                </Typography>
            )}
        </Box>
    );

    const ReviewStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review Challenge
            </Typography>
            
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>{formData.title}</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {formData.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Type</Typography>
                        <Typography variant="body2">{formData.type}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Category</Typography>
                        <Typography variant="body2">{formData.category}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Max Participants</Typography>
                        <Typography variant="body2">{formData.maxParticipants}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">End Date</Typography>
                        <Typography variant="body2">
                            {new Date(formData.endDate).toLocaleDateString()}
                        </Typography>
                    </Grid>
                </Grid>

                {formData.rules.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Rules</Typography>
                        {formData.rules.map((rule, index) => (
                            <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                {index + 1}. {rule}
                            </Typography>
                        ))}
                    </Box>
                )}

                {formData.prizes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Prizes</Typography>
                        {formData.prizes.map((prize, index) => (
                            <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                {prize.position}. {prize.title} - {prize.value}
                            </Typography>
                        ))}
                    </Box>
                )}

                {formData.tags.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                        <Box>
                            {formData.tags.map((tag) => (
                                <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );

    const getStepContent = (step) => {
        switch (step) {
            case 0: return <BasicInformationStep />;
            case 1: return <RulesStep />;
            case 2: return <PrizesVotingStep />;
            case 3: return <ReviewStep />;
            default: return 'Unknown step';
        }
    };

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">
                    You must be logged in to create a challenge.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Fade in={true}>
                <Box>
                    <Box display="flex" alignItems="center" mb={4}>
                        <IconButton onClick={() => navigate('/challenges')} sx={{ mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h4" component="h1">
                            Create New Challenge
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <Paper elevation={1} sx={{ p: 4 }}>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                    <StepContent>
                                        {getStepContent(index)}
                                        <Box sx={{ mb: 2, mt: 3 }}>
                                            <div>
                                                <Button
                                                    variant="contained"
                                                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                                                    disabled={!validateStep(index) || loading}
                                                    sx={{ mt: 1, mr: 1 }}
                                                >
                                                    {index === steps.length - 1 ? 
                                                        (loading ? 'Creating...' : 'Create Challenge') : 
                                                        'Continue'
                                                    }
                                                </Button>
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
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
};

export default CreateChallenge;
