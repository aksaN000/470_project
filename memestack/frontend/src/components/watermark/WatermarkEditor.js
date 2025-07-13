import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Switch,
    FormControlLabel,
    Button,
    Grid,
    Chip,
    Alert,
    Divider,
    IconButton,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Preview as PreviewIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Palette as PaletteIcon,
    TextFields as TextFieldsIcon,
    Image as ImageIcon,
    Pattern as PatternIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { 
    addTextWatermark, 
    addImageWatermark, 
    addPatternWatermark,
    loadImage,
    blobToFile,
    WATERMARK_PRESETS,
    WATERMARK_POSITIONS
} from '../utils/watermark';

const WatermarkEditor = ({ 
    originalImage, 
    onWatermarkedImage, 
    onError,
    disabled = false 
}) => {
    const [watermarkType, setWatermarkType] = useState('text'); // text, image, pattern
    const [previewImage, setPreviewImage] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Text watermark settings
    const [textSettings, setTextSettings] = useState({
        text: 'MemeStack',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        position: 'bottom-right',
        opacity: 0.8,
        backgroundColor: '#000000',
        backgroundOpacity: 0.3,
        padding: 20,
        rotation: 0,
        useBackground: true
    });

    // Image watermark settings
    const [imageSettings, setImageSettings] = useState({
        position: 'bottom-right',
        size: 'small',
        opacity: 0.8,
        padding: 20,
        rotation: 0
    });

    // Pattern watermark settings
    const [patternSettings, setPatternSettings] = useState({
        text: 'MemeStack',
        fontSize: 20,
        color: '#ffffff',
        opacity: 0.1,
        spacing: 150,
        rotation: -45
    });

    const [watermarkImageFile, setWatermarkImageFile] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState('subtle');

    useEffect(() => {
        if (originalImage) {
            generatePreview();
        }
    }, [
        originalImage, 
        watermarkType, 
        textSettings, 
        imageSettings, 
        patternSettings, 
        watermarkImageFile
    ]);

    const generatePreview = async () => {
        if (!originalImage || processing) return;

        try {
            setProcessing(true);
            const sourceImage = await loadImage(originalImage);
            let watermarkedBlob;

            switch (watermarkType) {
                case 'text':
                    watermarkedBlob = await addTextWatermark(sourceImage, {
                        text: textSettings.text,
                        fontSize: textSettings.fontSize,
                        fontFamily: textSettings.fontFamily,
                        color: `rgba(${hexToRgb(textSettings.color)}, ${textSettings.opacity})`,
                        position: textSettings.position,
                        padding: textSettings.padding,
                        backgroundColor: textSettings.useBackground 
                            ? `rgba(${hexToRgb(textSettings.backgroundColor)}, ${textSettings.backgroundOpacity})`
                            : 'transparent',
                        rotation: textSettings.rotation
                    });
                    break;

                case 'image':
                    if (watermarkImageFile) {
                        const watermarkImage = await loadImage(watermarkImageFile);
                        watermarkedBlob = await addImageWatermark(sourceImage, watermarkImage, {
                            position: imageSettings.position,
                            size: imageSettings.size,
                            opacity: imageSettings.opacity,
                            padding: imageSettings.padding,
                            rotation: imageSettings.rotation
                        });
                    } else {
                        setPreviewImage(originalImage);
                        return;
                    }
                    break;

                case 'pattern':
                    watermarkedBlob = await addPatternWatermark(sourceImage, patternSettings.text, {
                        fontSize: patternSettings.fontSize,
                        color: `rgba(${hexToRgb(patternSettings.color)}, ${patternSettings.opacity})`,
                        spacing: patternSettings.spacing,
                        rotation: patternSettings.rotation
                    });
                    break;

                default:
                    setPreviewImage(originalImage);
                    return;
            }

            const previewUrl = URL.createObjectURL(watermarkedBlob);
            setPreviewImage(previewUrl);

            // Notify parent component
            if (onWatermarkedImage) {
                onWatermarkedImage(watermarkedBlob);
            }

        } catch (error) {
            console.error('Watermark generation failed:', error);
            if (onError) {
                onError(error.message || 'Failed to generate watermark');
            }
            setPreviewImage(originalImage);
        } finally {
            setProcessing(false);
        }
    };

    const applyPreset = (presetName) => {
        const preset = WATERMARK_PRESETS[presetName];
        if (preset && watermarkType === 'text') {
            setTextSettings(prev => ({ ...prev, ...preset }));
            setSelectedPreset(presetName);
        }
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 255, 255';
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                if (onError) onError('Watermark image must be less than 5MB');
                return;
            }
            setWatermarkImageFile(file);
        }
    };

    const downloadWatermarked = async () => {
        if (!previewImage || previewImage === originalImage) return;

        try {
            const response = await fetch(previewImage);
            const blob = await response.blob();
            const file = blobToFile(blob, `watermarked_meme_${Date.now()}.png`);
            
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            if (onError) onError('Failed to download watermarked image');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaletteIcon />
                        Watermark Editor
                    </Typography>

                    {/* Watermark Type Selection */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Watermark Type
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {[
                                { value: 'text', label: 'Text', icon: <TextFieldsIcon /> },
                                { value: 'image', label: 'Image', icon: <ImageIcon /> },
                                { value: 'pattern', label: 'Pattern', icon: <PatternIcon /> }
                            ].map((type) => (
                                <Chip
                                    key={type.value}
                                    label={type.label}
                                    icon={type.icon}
                                    variant={watermarkType === type.value ? 'filled' : 'outlined'}
                                    color={watermarkType === type.value ? 'primary' : 'default'}
                                    onClick={() => setWatermarkType(type.value)}
                                    disabled={disabled}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Text Watermark Settings */}
                    {watermarkType === 'text' && (
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Text Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {/* Presets */}
                                    <Grid item xs={12}>
                                        <Typography variant="body2" gutterBottom>
                                            Quick Presets
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            {Object.keys(WATERMARK_PRESETS).map((preset) => (
                                                <Chip
                                                    key={preset}
                                                    label={preset.charAt(0).toUpperCase() + preset.slice(1)}
                                                    variant={selectedPreset === preset ? 'filled' : 'outlined'}
                                                    size="small"
                                                    onClick={() => applyPreset(preset)}
                                                    disabled={disabled}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Watermark Text"
                                            value={textSettings.text}
                                            onChange={(e) => setTextSettings(prev => ({ ...prev, text: e.target.value }))}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Position</InputLabel>
                                            <Select
                                                value={textSettings.position}
                                                onChange={(e) => setTextSettings(prev => ({ ...prev, position: e.target.value }))}
                                                label="Position"
                                                disabled={disabled}
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
                                        <Typography gutterBottom>Font Size: {textSettings.fontSize}px</Typography>
                                        <Slider
                                            value={textSettings.fontSize}
                                            onChange={(e, value) => setTextSettings(prev => ({ ...prev, fontSize: value }))}
                                            min={10}
                                            max={72}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Opacity: {Math.round(textSettings.opacity * 100)}%</Typography>
                                        <Slider
                                            value={textSettings.opacity}
                                            onChange={(e, value) => setTextSettings(prev => ({ ...prev, opacity: value }))}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Text Color"
                                            type="color"
                                            value={textSettings.color}
                                            onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={textSettings.useBackground}
                                                    onChange={(e) => setTextSettings(prev => ({ ...prev, useBackground: e.target.checked }))}
                                                    disabled={disabled}
                                                />
                                            }
                                            label="Background"
                                        />
                                    </Grid>

                                    {textSettings.useBackground && (
                                        <>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Background Color"
                                                    type="color"
                                                    value={textSettings.backgroundColor}
                                                    onChange={(e) => setTextSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                    disabled={disabled}
                                                />
                                            </Grid>

                                            <Grid item xs={6}>
                                                <Typography gutterBottom>Background Opacity: {Math.round(textSettings.backgroundOpacity * 100)}%</Typography>
                                                <Slider
                                                    value={textSettings.backgroundOpacity}
                                                    onChange={(e, value) => setTextSettings(prev => ({ ...prev, backgroundOpacity: value }))}
                                                    min={0.1}
                                                    max={1}
                                                    step={0.1}
                                                    disabled={disabled}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* Image Watermark Settings */}
                    {watermarkType === 'image' && (
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Image Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            disabled={disabled}
                                            startIcon={<ImageIcon />}
                                        >
                                            Upload Watermark Image
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </Button>
                                        {watermarkImageFile && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {watermarkImageFile.name}
                                            </Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Position</InputLabel>
                                            <Select
                                                value={imageSettings.position}
                                                onChange={(e) => setImageSettings(prev => ({ ...prev, position: e.target.value }))}
                                                label="Position"
                                                disabled={disabled}
                                            >
                                                {WATERMARK_POSITIONS.map((pos) => (
                                                    <MenuItem key={pos.value} value={pos.value}>
                                                        {pos.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Size</InputLabel>
                                            <Select
                                                value={imageSettings.size}
                                                onChange={(e) => setImageSettings(prev => ({ ...prev, size: e.target.value }))}
                                                label="Size"
                                                disabled={disabled}
                                            >
                                                <MenuItem value="small">Small</MenuItem>
                                                <MenuItem value="medium">Medium</MenuItem>
                                                <MenuItem value="large">Large</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Opacity: {Math.round(imageSettings.opacity * 100)}%</Typography>
                                        <Slider
                                            value={imageSettings.opacity}
                                            onChange={(e, value) => setImageSettings(prev => ({ ...prev, opacity: value }))}
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                            disabled={disabled}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* Pattern Watermark Settings */}
                    {watermarkType === 'pattern' && (
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Pattern Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Pattern Text"
                                            value={patternSettings.text}
                                            onChange={(e) => setPatternSettings(prev => ({ ...prev, text: e.target.value }))}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Font Size: {patternSettings.fontSize}px</Typography>
                                        <Slider
                                            value={patternSettings.fontSize}
                                            onChange={(e, value) => setPatternSettings(prev => ({ ...prev, fontSize: value }))}
                                            min={10}
                                            max={48}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Opacity: {Math.round(patternSettings.opacity * 100)}%</Typography>
                                        <Slider
                                            value={patternSettings.opacity}
                                            onChange={(e, value) => setPatternSettings(prev => ({ ...prev, opacity: value }))}
                                            min={0.01}
                                            max={0.5}
                                            step={0.01}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography gutterBottom>Spacing: {patternSettings.spacing}px</Typography>
                                        <Slider
                                            value={patternSettings.spacing}
                                            onChange={(e, value) => setPatternSettings(prev => ({ ...prev, spacing: value }))}
                                            min={50}
                                            max={300}
                                            disabled={disabled}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Color"
                                            type="color"
                                            value={patternSettings.color}
                                            onChange={(e) => setPatternSettings(prev => ({ ...prev, color: e.target.value }))}
                                            disabled={disabled}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={generatePreview}
                            disabled={disabled || processing}
                        >
                            Refresh Preview
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadWatermarked}
                            disabled={disabled || !previewImage || previewImage === originalImage}
                        >
                            Download
                        </Button>
                    </Box>

                    {/* Preview */}
                    {previewImage && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Preview
                            </Typography>
                            <Box
                                component="img"
                                src={previewImage}
                                alt="Watermark Preview"
                                sx={{
                                    width: '100%',
                                    maxHeight: 400,
                                    objectFit: 'contain',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default WatermarkEditor;
