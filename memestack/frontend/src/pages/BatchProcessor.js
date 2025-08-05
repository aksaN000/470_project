import React, { useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    LinearProgress,
    Alert,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Slider,
    Divider,
    Container,
    Paper,
    Fade,
    Zoom,
    useTheme,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    DynamicFeed as BatchIcon,
    Download as DownloadIcon,
    Preview as PreviewIcon,
    Delete as DeleteIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Image as ImageIcon,
    Settings as SettingsIcon,
    ExpandMore as ExpandMoreIcon,
    PlayArrow as StartIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';
import {
    batchProcess,
    downloadBatchResults,
    createBatchPreview,
    validateBatchImages,
    BATCH_PRESETS
} from '../utils/batchProcessor';
import { WATERMARK_POSITIONS } from '../utils/watermark';

const BatchProcessor = () => {
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    const [files, setFiles] = useState([]);
    const [operation, setOperation] = useState('watermark');
    const [preset, setPreset] = useState('');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState([]);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedPreview, setSelectedPreview] = useState(null);
    
    const fileInputRef = useRef(null);

    // Operation-specific settings
    const [watermarkSettings, setWatermarkSettings] = useState({
        type: 'text',
        text: 'MemeStack',
        position: 'bottom-right',
        fontSize: 24,
        color: '#ffffff',
        opacity: 0.8,
        backgroundColor: '#000000',
        backgroundOpacity: 0.3,
        useBackground: true
    });

    const [resizeSettings, setResizeSettings] = useState({
        width: 1080,
        height: 1080,
        maintainAspectRatio: true,
        quality: 0.9
    });

    const [compressSettings, setCompressSettings] = useState({
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1080
    });

    const [formatSettings, setFormatSettings] = useState({
        format: 'png',
        quality: 0.9
    });

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const validation = validateBatchImages(selectedFiles);
        
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }
        
        setFiles(validation.validFiles);
        setErrors([]);
        setResults([]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setFiles([]);
        setResults([]);
        setErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const applyPreset = (presetName) => {
        const presetConfig = BATCH_PRESETS[presetName];
        if (!presetConfig) return;

        setOperation(presetConfig.operation);
        
        switch (presetConfig.operation) {
            case 'watermark':
                setWatermarkSettings(prev => ({ ...prev, ...presetConfig.options }));
                break;
            case 'resize':
                setResizeSettings(prev => ({ ...prev, ...presetConfig.options }));
                break;
            case 'compress':
                setCompressSettings(prev => ({ ...prev, ...presetConfig.options }));
                break;
            case 'format':
                setFormatSettings(prev => ({ ...prev, ...presetConfig.options }));
                break;
        }
    };

    const getOperationOptions = () => {
        switch (operation) {
            case 'watermark':
                return {
                    type: watermarkSettings.type,
                    text: watermarkSettings.text,
                    position: watermarkSettings.position,
                    fontSize: watermarkSettings.fontSize,
                    color: `rgba(${hexToRgb(watermarkSettings.color)}, ${watermarkSettings.opacity})`,
                    backgroundColor: watermarkSettings.useBackground 
                        ? `rgba(${hexToRgb(watermarkSettings.backgroundColor)}, ${watermarkSettings.backgroundOpacity})`
                        : 'transparent'
                };
            case 'resize':
                return resizeSettings;
            case 'compress':
                return compressSettings;
            case 'format':
                return formatSettings;
            default:
                return {};
        }
    };

    const startBatchProcessing = async () => {
        if (files.length === 0) {
            setErrors(['No files selected for processing']);
            return;
        }

        setProcessing(true);
        setProgress(0);
        setErrors([]);

        try {
            const options = getOperationOptions();
            
            const batchResults = await batchProcess(
                files,
                operation,
                options,
                (current, total) => {
                    setProgress((current / total) * 100);
                },
                (error) => {
                    console.error('Batch processing error:', error);
                }
            );

            setResults(batchResults);
            
            const errorCount = batchResults.filter(r => !r.success).length;
            if (errorCount > 0) {
                setErrors([`${errorCount} file(s) failed to process. Check individual results.`]);
            }

        } catch (error) {
            setErrors([error.message || 'Batch processing failed']);
        } finally {
            setProcessing(false);
            setProgress(0);
        }
    };

    const downloadResults = async () => {
        try {
            await downloadBatchResults(results, `batch_${operation}_${Date.now()}.zip`);
        } catch (error) {
            setErrors([error.message || 'Failed to download results']);
        }
    };

    const openPreview = (result) => {
        setSelectedPreview(result);
        setPreviewDialogOpen(true);
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 255, 255';
    };

    const successfulResults = results.filter(r => r.success);

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: mode === 'light' 
                ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            py: 4,
        }}>
            <Container maxWidth="lg">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Enhanced Header */}
                        <Zoom in={true} timeout={1200}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
                                    background: mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(99, 102, 241, 0.1)',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                                    },
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography 
                                            variant="h3" 
                                            component="h1" 
                                            sx={{
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                color: 'transparent',
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <BatchIcon />
                                            ⚡ Batch Image Processor
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Process multiple images with powerful batch operations
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                borderRadius: '20px',
                                p: 4,
                            }}
                        >

                    {/* File Upload */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                            p: 3,
                            mb: 3
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ 
                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}>
                            1. Select Images
                        </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                            sx={{ mr: 2 }}
                        >
                            Choose Files
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Button>
                        {files.length > 0 && (
                            <Button
                                variant="text"
                                startIcon={<ClearIcon />}
                                onClick={clearFiles}
                                color="error"
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>

                    {files.length > 0 && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {files.length} file(s) selected
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto' }}>
                                {files.map((file, index) => (
                                    <Chip
                                        key={index}
                                        label={file.name}
                                        onDelete={() => removeFile(index)}
                                        size="small"
                                        icon={<ImageIcon />}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                    </Paper>

                    {/* Operation Settings */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                            p: 3,
                            mb: 3
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ 
                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}>
                            2. Configure Operation
                        </Typography>

                    {/* Presets */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Quick Presets
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.keys(BATCH_PRESETS).map((presetName) => (
                                <Chip
                                    key={presetName}
                                    label={presetName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    variant={preset === presetName ? 'filled' : 'outlined'}
                                    onClick={() => {
                                        setPreset(presetName);
                                        applyPreset(presetName);
                                    }}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Operation Type */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Operation Type</InputLabel>
                        <Select
                            value={operation}
                            onChange={(e) => setOperation(e.target.value)}
                            label="Operation Type"
                        >
                            <MenuItem value="watermark">Add Watermark</MenuItem>
                            <MenuItem value="resize">Resize Images</MenuItem>
                            <MenuItem value="compress">Compress Images</MenuItem>
                            <MenuItem value="format">Convert Format</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Operation-specific settings */}
                    {operation === 'watermark' && (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Watermark Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Watermark Text"
                                            value={watermarkSettings.text}
                                            onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Position</InputLabel>
                                            <Select
                                                value={watermarkSettings.position}
                                                onChange={(e) => setWatermarkSettings(prev => ({ ...prev, position: e.target.value }))}
                                                label="Position"
                                            >
                                                {WATERMARK_POSITIONS.map((pos) => (
                                                    <MenuItem key={pos.value} value={pos.value}>
                                                        {pos.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Font Size: {watermarkSettings.fontSize}px</Typography>
                                        <Slider
                                            value={watermarkSettings.fontSize}
                                            onChange={(e, value) => setWatermarkSettings(prev => ({ ...prev, fontSize: value }))}
                                            min={10}
                                            max={72}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Opacity: {Math.round(watermarkSettings.opacity * 100)}%</Typography>
                                        <Slider
                                            value={watermarkSettings.opacity}
                                            onChange={(e, value) => setWatermarkSettings(prev => ({ ...prev, opacity: value }))}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {operation === 'resize' && (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Resize Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Width (px)"
                                            type="number"
                                            value={resizeSettings.width}
                                            onChange={(e) => setResizeSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Height (px)"
                                            type="number"
                                            value={resizeSettings.height}
                                            onChange={(e) => setResizeSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={resizeSettings.maintainAspectRatio}
                                                    onChange={(e) => setResizeSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                                                />
                                            }
                                            label="Maintain Aspect Ratio"
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {operation === 'compress' && (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Compression Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Quality: {Math.round(compressSettings.quality * 100)}%</Typography>
                                        <Slider
                                            value={compressSettings.quality}
                                            onChange={(e, value) => setCompressSettings(prev => ({ ...prev, quality: value }))}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Max Width (px)"
                                            type="number"
                                            value={compressSettings.maxWidth}
                                            onChange={(e) => setCompressSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || null }))}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Max Height (px)"
                                            type="number"
                                            value={compressSettings.maxHeight}
                                            onChange={(e) => setCompressSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || null }))}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {operation === 'format' && (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Format Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Output Format</InputLabel>
                                            <Select
                                                value={formatSettings.format}
                                                onChange={(e) => setFormatSettings(prev => ({ ...prev, format: e.target.value }))}
                                                label="Output Format"
                                            >
                                                <MenuItem value="png">PNG</MenuItem>
                                                <MenuItem value="jpeg">JPEG</MenuItem>
                                                <MenuItem value="webp">WebP</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Quality: {Math.round(formatSettings.quality * 100)}%</Typography>
                                        <Slider
                                            value={formatSettings.quality}
                                            onChange={(e, value) => setFormatSettings(prev => ({ ...prev, quality: value }))}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    </Paper>

                    {/* Process Button */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                            p: 3,
                            mb: 3
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ 
                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}>
                            3. Process Images
                        </Typography>
                    
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<StartIcon />}
                        onClick={startBatchProcessing}
                        disabled={files.length === 0 || processing}
                        sx={{ mb: 2 }}
                    >
                        {processing ? 'Processing...' : `Process ${files.length} Image(s)`}
                    </Button>

                    {processing && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress variant="determinate" value={progress} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {Math.round(progress)}% complete
                            </Typography>
                        </Box>
                    )}
                    </Paper>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Errors:</Typography>
                    <ul style={{ margin: 0 }}>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Alert>
            )}

                    {/* Results */}
                    {results.length > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                                p: 3
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 'bold'
                                }}>
                                    Results ({successfulResults.length}/{results.length} successful)
                                </Typography>
                                {successfulResults.length > 0 && (
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadResults}
                                        sx={{
                                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                            border: 0,
                                            borderRadius: '25px',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #5855eb, #7c3aed)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Download All
                                    </Button>
                                )}
                            </Box>

                        <Grid container spacing={2}>
                            {results.map((result, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                {result.success ? (
                                                    <SuccessIcon color="success" fontSize="small" />
                                                ) : (
                                                    <ErrorIcon color="error" fontSize="small" />
                                                )}
                                                <Typography variant="body2" noWrap>
                                                    {result.original.name}
                                                </Typography>
                                            </Box>
                                            
                                            {result.success ? (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {result.result.filename}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openPreview(result)}
                                                        >
                                                            <PreviewIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="error">
                                                    {result.error}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        </Paper>
                    )}

                    {/* Preview Dialog */}
                    <Dialog
                        open={previewDialogOpen}
                        onClose={() => setPreviewDialogOpen(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        {selectedPreview && (
                            <>
                                <DialogTitle>
                                    Preview: {selectedPreview.result.filename}
                                </DialogTitle>
                                <DialogContent>
                                    <Box
                                        component="img"
                                        src={selectedPreview.result.url}
                                        alt="Preview"
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '70vh',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setPreviewDialogOpen(false)}>
                                        Close
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => {
                                            const url = selectedPreview.result.url;
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = selectedPreview.result.filename;
                                            a.click();
                                        }}
                                    >
                                        Download
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default BatchProcessor;
