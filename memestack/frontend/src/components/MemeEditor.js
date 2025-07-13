import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Divider,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
    ButtonGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    TextFields,
    Palette,
    Download,
    Undo,
    Redo,
    Add,
    Delete,
    Save,
    EmojiEmotions,
    Star,
    Favorite,
    ThumbUp,
    Whatshot,
    Visibility,
    ExpandMore,
    Brightness6,
    Contrast,
    Blur,
    Rotate90DegreesCcw,
    Flip
} from '@mui/icons-material';

const MemeEditor = ({ imageUrl, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [textElements, setTextElements] = useState([]);
    const [emojiElements, setEmojiElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [selectedType, setSelectedType] = useState('text'); // 'text' or 'emoji'
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [activeTab, setActiveTab] = useState(0);

    // Image effects
    const [imageEffects, setImageEffects] = useState({
        brightness: 100,
        contrast: 100,
        blur: 0,
        rotation: 0,
        flipX: false,
        flipY: false
    });

    // Text editing states
    const [currentText, setCurrentText] = useState('');
    const [fontSize, setFontSize] = useState(32);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [isBold, setIsBold] = useState(true);
    const [isItalic, setIsItalic] = useState(false);
    const [textShadow, setTextShadow] = useState(true);
    const [textAlign, setTextAlign] = useState('center');
    const [textRotation, setTextRotation] = useState(0);
    const [textOpacity, setTextOpacity] = useState(100);

    // Emoji states
    const [selectedEmoji, setSelectedEmoji] = useState('😂');
    const [emojiSize, setEmojiSize] = useState(48);

    // Shapes and drawing
    const [selectedShape, setSelectedShape] = useState('rectangle');
    const [shapeColor, setShapeColor] = useState('#FF0000');
    const [shapeOpacity, setShapeOpacity] = useState(50);
    const [shapes, setShapes] = useState([]);

    // Stickers and overlays
    const [stickers, setStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState('💥');

    // Animation and timeline
    const [animationPresets, setAnimationPresets] = useState([]);
    const [selectedAnimation, setSelectedAnimation] = useState('none');

    // History for undo/redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Layer management
    const [layers, setLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);

    // Templates and presets
    const [memeTemplates, setMemeTemplates] = useState([]);
    const [textPresets, setTextPresets] = useState([]);

    // Popular emojis and icons
    const popularEmojis = [
        '😂', '🤣', '😭', '😎', '🤔', '😱', '🔥', '💯', 
        '👍', '👎', '💪', '🙌', '👏', '🤝', '✨', '💖',
        '😍', '😘', '😜', '🤪', '😴', '🤤', '🥵', '🥶',
        '🤯', '🤢', '🤮', '😵', '🤡', '👻', '💀', '👽'
    ];

    const iconEmojis = [
        '⭐', '🌟', '✨', '💫', '⚡', '🔥', '💥', '💢',
        '💯', '💎', '🏆', '🎯', '🎪', '🎭', '🎨', '🎪',
        '❤️', '💔', '💕', '💖', '💗', '💙', '💚', '💛',
        '✅', '❌', '⚠️', '🚫', '💀', '☠️', '⚰️', '👑'
    ];

    // Stickers and overlays
    const stickerCategories = {
        'Explosion': ['💥', '💢', '⚡', '🔥', '✨', '🌟', '💫', '⭐'],
        'Arrows': ['↑', '↓', '←', '→', '↗️', '↘️', '↙️', '↖️', '🔄', '🔃'],
        'Stamps': ['💯', '🆕', '🆓', '🆒', '🆗', '🔥', '⚡', '✨'],
        'Frames': ['📱', '💻', '🖥️', '📺', '🎬', '📸', '🎥', '📹']
    };

    // Text style presets
    const textStylePresets = [
        { name: 'Classic Meme', font: 'Impact', size: 48, color: '#FFFFFF', stroke: '#000000', strokeWidth: 3, bold: true },
        { name: 'Fancy', font: 'Georgia', size: 36, color: '#FFD700', stroke: '#8B4513', strokeWidth: 2, italic: true },
        { name: 'Modern', font: 'Helvetica', size: 32, color: '#FF6B6B', stroke: 'transparent', strokeWidth: 0, bold: true },
        { name: 'Retro', font: 'Comic Sans MS', size: 40, color: '#FF69B4', stroke: '#4B0082', strokeWidth: 2, bold: true },
        { name: 'Professional', font: 'Arial', size: 28, color: '#2C3E50', stroke: '#ECF0F1', strokeWidth: 1, bold: false }
    ];

    // Meme templates with predefined text positions
    const memeTemplatePresets = [
        { name: 'Top/Bottom', positions: [{ x: 400, y: 80, text: 'TOP TEXT' }, { x: 400, y: 520, text: 'BOTTOM TEXT' }] },
        { name: 'Left/Right', positions: [{ x: 200, y: 300, text: 'LEFT' }, { x: 600, y: 300, text: 'RIGHT' }] },
        { name: 'Corner Labels', positions: [{ x: 100, y: 80, text: 'WHEN' }, { x: 700, y: 520, text: 'THEN' }] },
        { name: 'Triple Stack', positions: [{ x: 400, y: 100, text: 'FIRST' }, { x: 400, y: 300, text: 'SECOND' }, { x: 400, y: 500, text: 'THIRD' }] }
    ];

    // Drawing tools
    const drawingTools = ['brush', 'arrow', 'rectangle', 'circle', 'line', 'highlighter'];

    // Color palettes
    const colorPalettes = {
        'Classic': ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        'Meme': ['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
        'Retro': ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C', '#5E60CE', '#7209B7'],
        'Neon': ['#FF10F0', '#00FFFF', '#FFFF00', '#FF073A', '#39FF14', '#FF8C00', '#9400D3', '#FF1493']
    };

    // Load image when component mounts
    useEffect(() => {
        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImage(img);
                setCanvasSize({ width: img.width, height: img.height });
                drawCanvas();
            };
            img.src = imageUrl;
        }
    }, [imageUrl]);

    // Draw canvas with image and all elements
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply image transformations
        ctx.save();
        
        // Center for transformations
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply rotation
        if (imageEffects.rotation !== 0) {
            ctx.rotate((imageEffects.rotation * Math.PI) / 180);
        }
        
        // Apply flip
        ctx.scale(
            imageEffects.flipX ? -1 : 1,
            imageEffects.flipY ? -1 : 1
        );

        // Apply filters
        ctx.filter = `brightness(${imageEffects.brightness}%) contrast(${imageEffects.contrast}%) blur(${imageEffects.blur}px)`;
        
        // Draw background image
        ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        
        ctx.restore();

        // Draw shapes (behind text and emojis)
        shapes.forEach((shape, index) => {
            ctx.save();
            ctx.globalAlpha = shape.opacity / 100;
            ctx.fillStyle = shape.color;
            ctx.strokeStyle = shape.strokeColor || shape.color;
            ctx.lineWidth = shape.strokeWidth || 2;

            switch (shape.type) {
                case 'rectangle':
                    if (shape.filled) {
                        ctx.fillRect(shape.x - shape.width/2, shape.y - shape.height/2, shape.width, shape.height);
                    } else {
                        ctx.strokeRect(shape.x - shape.width/2, shape.y - shape.height/2, shape.width, shape.height);
                    }
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                    if (shape.filled) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    break;
                case 'arrow':
                    drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.width || 20);
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(shape.startX, shape.startY);
                    ctx.lineTo(shape.endX, shape.endY);
                    ctx.lineWidth = shape.width || 3;
                    ctx.stroke();
                    break;
            }

            // Selection indicator for shapes
            if (selectedElement === index && selectedType === 'shape') {
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#ff9800';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(shape.x - 20, shape.y - 20, 40, 40);
            }
            ctx.restore();
        });

        // Draw stickers
        stickers.forEach((sticker, index) => {
            ctx.save();
            ctx.globalAlpha = sticker.opacity / 100;
            ctx.font = `${sticker.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Apply rotation if any
            if (sticker.rotation) {
                ctx.translate(sticker.x, sticker.y);
                ctx.rotate((sticker.rotation * Math.PI) / 180);
                ctx.fillText(sticker.emoji, 0, 0);
                ctx.translate(-sticker.x, -sticker.y);
            } else {
                ctx.fillText(sticker.emoji, sticker.x, sticker.y);
            }

            // Selection indicator for stickers
            if (selectedElement === index && selectedType === 'sticker') {
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#9c27b0';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                    sticker.x - sticker.size/2 - 5,
                    sticker.y - sticker.size/2 - 5,
                    sticker.size + 10,
                    sticker.size + 10
                );
            }
            ctx.restore();
        });

        // Draw emoji elements
        emojiElements.forEach((element, index) => {
            ctx.save();
            ctx.globalAlpha = element.opacity / 100 || 1;
            ctx.font = `${element.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (element.rotation) {
                ctx.translate(element.x, element.y);
                ctx.rotate((element.rotation * Math.PI) / 180);
                ctx.fillText(element.emoji, 0, 0);
                ctx.translate(-element.x, -element.y);
            } else {
                ctx.fillText(element.emoji, element.x, element.y);
            }

            // Selection indicator for emojis
            if (selectedElement === index && selectedType === 'emoji') {
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                    element.x - element.size/2 - 5,
                    element.y - element.size/2 - 5,
                    element.size + 10,
                    element.size + 10
                );
            }
            ctx.restore();
        });

        // Draw text elements (on top)
        textElements.forEach((element, index) => {
            ctx.save();
            
            // Set global alpha for text opacity
            ctx.globalAlpha = (element.opacity || 100) / 100;
            
            // Set font properties
            let fontStyle = '';
            if (element.isBold) fontStyle += 'bold ';
            if (element.isItalic) fontStyle += 'italic ';
            ctx.font = `${fontStyle}${element.fontSize}px ${element.fontFamily}`;
            ctx.textAlign = element.textAlign || 'center';
            ctx.textBaseline = 'middle';

            // Apply rotation if any
            if (element.rotation) {
                ctx.translate(element.x, element.y);
                ctx.rotate((element.rotation * Math.PI) / 180);
            }

            // Text shadow
            if (element.textShadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }

            // Stroke
            if (element.strokeWidth > 0 && element.strokeColor !== 'transparent') {
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = element.strokeWidth;
                ctx.strokeText(element.text, element.rotation ? 0 : element.x, element.rotation ? 0 : element.y);
            }

            // Fill text
            ctx.fillStyle = element.textColor;
            ctx.fillText(element.text, element.rotation ? 0 : element.x, element.rotation ? 0 : element.y);

            if (element.rotation) {
                ctx.translate(-element.x, -element.y);
            }

            // Selection indicator for text
            if (selectedElement === index && selectedType === 'text') {
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                const metrics = ctx.measureText(element.text);
                const textWidth = metrics.width;
                const textHeight = element.fontSize;
                ctx.strokeRect(
                    element.x - textWidth/2 - 10,
                    element.y - textHeight/2 - 10,
                    textWidth + 20,
                    textHeight + 20
                );
            }

            ctx.restore();
        });
    }, [image, textElements, emojiElements, shapes, stickers, selectedElement, selectedType, canvasSize, imageEffects]);

    // Helper function to draw arrows
    const drawArrow = (ctx, fromX, fromY, toX, toY, width) => {
        const headlen = width; // length of arrow head in pixels
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    // Redraw canvas when text elements change
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Add new text element
    const addTextElement = () => {
        if (!currentText.trim()) return;

        const newElement = {
            text: currentText,
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            fontSize,
            fontFamily,
            textColor,
            strokeColor,
            strokeWidth,
            isBold,
            isItalic,
            textShadow
        };

        setTextElements([...textElements, newElement]);
        setSelectedElement(textElements.length);
        setCurrentText('');
    };

    // Add new emoji element
    const addEmojiElement = () => {
        const newElement = {
            emoji: selectedEmoji,
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            size: emojiSize,
            opacity: 100,
            rotation: 0
        };

        setEmojiElements([...emojiElements, newElement]);
        setSelectedElement(emojiElements.length);
        setSelectedType('emoji');
        saveToHistory();
    };

    // Add shape element
    const addShape = (type) => {
        const newShape = {
            type,
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            width: type === 'rectangle' ? 100 : undefined,
            height: type === 'rectangle' ? 60 : undefined,
            radius: type === 'circle' ? 50 : undefined,
            startX: type === 'arrow' || type === 'line' ? canvasSize.width / 2 - 50 : undefined,
            startY: type === 'arrow' || type === 'line' ? canvasSize.height / 2 : undefined,
            endX: type === 'arrow' || type === 'line' ? canvasSize.width / 2 + 50 : undefined,
            endY: type === 'arrow' || type === 'line' ? canvasSize.height / 2 : undefined,
            color: shapeColor,
            strokeColor: '#000000',
            strokeWidth: 2,
            opacity: shapeOpacity,
            filled: true
        };

        setShapes([...shapes, newShape]);
        setSelectedElement(shapes.length);
        setSelectedType('shape');
        saveToHistory();
    };

    // Add sticker element
    const addSticker = () => {
        const newSticker = {
            emoji: selectedSticker,
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            size: 64,
            opacity: 100,
            rotation: 0
        };

        setStickers([...stickers, newSticker]);
        setSelectedElement(stickers.length);
        setSelectedType('sticker');
        saveToHistory();
    };

    // Apply text style preset
    const applyTextPreset = (preset) => {
        setFontFamily(preset.font);
        setFontSize(preset.size);
        setTextColor(preset.color);
        setStrokeColor(preset.stroke);
        setStrokeWidth(preset.strokeWidth);
        setIsBold(preset.bold);
        setIsItalic(preset.italic || false);

        if (selectedElement !== null && selectedType === 'text') {
            updateSelectedElement('fontFamily', preset.font);
            updateSelectedElement('fontSize', preset.size);
            updateSelectedElement('textColor', preset.color);
            updateSelectedElement('strokeColor', preset.stroke);
            updateSelectedElement('strokeWidth', preset.strokeWidth);
            updateSelectedElement('isBold', preset.bold);
            updateSelectedElement('isItalic', preset.italic || false);
        }
    };

    // Apply meme template
    const applyMemeTemplate = (template) => {
        const newElements = template.positions.map(pos => ({
            text: pos.text,
            x: pos.x,
            y: pos.y,
            fontSize: 48,
            fontFamily: 'Impact',
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 3,
            isBold: true,
            isItalic: false,
            textShadow: true,
            textAlign: 'center',
            rotation: 0,
            opacity: 100
        }));

        setTextElements(newElements);
        setSelectedElement(0);
        setSelectedType('text');
        saveToHistory();
    };

    // History management
    const saveToHistory = () => {
        const state = {
            textElements: [...textElements],
            emojiElements: [...emojiElements],
            shapes: [...shapes],
            stickers: [...stickers],
            imageEffects: { ...imageEffects }
        };
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo function
    const undo = () => {
        if (historyIndex > 0) {
            const previousState = history[historyIndex - 1];
            setTextElements(previousState.textElements);
            setEmojiElements(previousState.emojiElements);
            setShapes(previousState.shapes);
            setStickers(previousState.stickers);
            setImageEffects(previousState.imageEffects);
            setHistoryIndex(historyIndex - 1);
        }
    };

    // Redo function
    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setTextElements(nextState.textElements);
            setEmojiElements(nextState.emojiElements);
            setShapes(nextState.shapes);
            setStickers(nextState.stickers);
            setImageEffects(nextState.imageEffects);
            setHistoryIndex(historyIndex + 1);
        }
    };

    // Duplicate selected element
    const duplicateElement = () => {
        if (selectedElement === null) return;

        if (selectedType === 'text') {
            const element = { ...textElements[selectedElement] };
            element.x += 20;
            element.y += 20;
            setTextElements([...textElements, element]);
            setSelectedElement(textElements.length);
        } else if (selectedType === 'emoji') {
            const element = { ...emojiElements[selectedElement] };
            element.x += 20;
            element.y += 20;
            setEmojiElements([...emojiElements, element]);
            setSelectedElement(emojiElements.length);
        } else if (selectedType === 'shape') {
            const element = { ...shapes[selectedElement] };
            element.x += 20;
            element.y += 20;
            setShapes([...shapes, element]);
            setSelectedElement(shapes.length);
        } else if (selectedType === 'sticker') {
            const element = { ...stickers[selectedElement] };
            element.x += 20;
            element.y += 20;
            setStickers([...stickers, element]);
            setSelectedElement(stickers.length);
        }
        saveToHistory();
    };

    // Layer management
    const moveLayer = (direction) => {
        if (selectedElement === null) return;

        let elements, setElements;
        if (selectedType === 'text') {
            elements = [...textElements];
            setElements = setTextElements;
        } else if (selectedType === 'emoji') {
            elements = [...emojiElements];
            setElements = setEmojiElements;
        } else if (selectedType === 'shape') {
            elements = [...shapes];
            setElements = setShapes;
        } else if (selectedType === 'sticker') {
            elements = [...stickers];
            setElements = setStickers;
        } else return;

        const currentIndex = selectedElement;
        const newIndex = direction === 'up' ? 
            Math.min(currentIndex + 1, elements.length - 1) : 
            Math.max(currentIndex - 1, 0);

        if (currentIndex !== newIndex) {
            [elements[currentIndex], elements[newIndex]] = [elements[newIndex], elements[currentIndex]];
            setElements(elements);
            setSelectedElement(newIndex);
            saveToHistory();
        }
    };

    // Update selected element
    const updateSelectedElement = (property, value) => {
        if (selectedElement === null) return;

        if (selectedType === 'text') {
            const updated = [...textElements];
            updated[selectedElement] = { ...updated[selectedElement], [property]: value };
            setTextElements(updated);
        } else if (selectedType === 'emoji') {
            const updated = [...emojiElements];
            updated[selectedElement] = { ...updated[selectedElement], [property]: value };
            setEmojiElements(updated);
        } else if (selectedType === 'shape') {
            const updated = [...shapes];
            updated[selectedElement] = { ...updated[selectedElement], [property]: value };
            setShapes(updated);
        } else if (selectedType === 'sticker') {
            const updated = [...stickers];
            updated[selectedElement] = { ...updated[selectedElement], [property]: value };
            setStickers(updated);
        }
    };

    // Delete selected element
    const deleteSelectedElement = () => {
        if (selectedElement === null) return;

        if (selectedType === 'text') {
            const updated = textElements.filter((_, index) => index !== selectedElement);
            setTextElements(updated);
        } else if (selectedType === 'emoji') {
            const updated = emojiElements.filter((_, index) => index !== selectedElement);
            setEmojiElements(updated);
        } else if (selectedType === 'shape') {
            const updated = shapes.filter((_, index) => index !== selectedElement);
            setShapes(updated);
        } else if (selectedType === 'sticker') {
            const updated = stickers.filter((_, index) => index !== selectedElement);
            setStickers(updated);
        }
        
        setSelectedElement(null);
        saveToHistory();
    };

    // Apply image effects
    const updateImageEffect = (property, value) => {
        setImageEffects(prev => ({
            ...prev,
            [property]: value
        }));
    };

    // Reset image effects
    const resetImageEffects = () => {
        setImageEffects({
            brightness: 100,
            contrast: 100,
            blur: 0,
            rotation: 0,
            flipX: false,
            flipY: false
        });
    };

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Handle canvas mouse events for dragging
    const handleCanvasMouseDown = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);

        console.log('Mouse down at:', { x, y }, 'Canvas size:', canvasSize);

        // Check if clicked on existing sticker
        let clickedSticker = null;
        stickers.forEach((element, index) => {
            if (x >= element.x - element.size/2 && 
                x <= element.x + element.size/2 && 
                y >= element.y - element.size/2 && 
                y <= element.y + element.size/2) {
                clickedSticker = index;
            }
        });

        // Check if clicked on existing shape
        let clickedShape = null;
        shapes.forEach((element, index) => {
            if (element.type === 'rectangle' &&
                x >= element.x - element.width/2 && 
                x <= element.x + element.width/2 && 
                y >= element.y - element.height/2 && 
                y <= element.y + element.height/2) {
                clickedShape = index;
            } else if (element.type === 'circle') {
                const distance = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
                if (distance <= element.radius) {
                    clickedShape = index;
                }
            }
        });

        // Check if clicked on existing emoji
        let clickedEmoji = null;
        emojiElements.forEach((element, index) => {
            if (x >= element.x - element.size/2 && 
                x <= element.x + element.size/2 && 
                y >= element.y - element.size/2 && 
                y <= element.y + element.size/2) {
                clickedEmoji = index;
            }
        });

        // Check if clicked on existing text
        let clickedText = null;
        textElements.forEach((element, index) => {
            const ctx = canvas.getContext('2d');
            let fontStyle = '';
            if (element.isBold) fontStyle += 'bold ';
            if (element.isItalic) fontStyle += 'italic ';
            ctx.font = `${fontStyle}${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            const textWidth = metrics.width;
            const textHeight = element.fontSize;

            if (x >= element.x - textWidth/2 && 
                x <= element.x + textWidth/2 && 
                y >= element.y - textHeight/2 && 
                y <= element.y + textHeight/2) {
                clickedText = index;
            }
        });

        // Prioritize selection: stickers > shapes > emojis > text
        if (clickedSticker !== null) {
            console.log('Selected sticker:', clickedSticker);
            setSelectedElement(clickedSticker);
            setSelectedType('sticker');
            setIsDragging(true);
            const element = stickers[clickedSticker];
            setDragOffset({ x: x - element.x, y: y - element.y });
        } else if (clickedShape !== null) {
            console.log('Selected shape:', clickedShape);
            setSelectedElement(clickedShape);
            setSelectedType('shape');
            setIsDragging(true);
            const element = shapes[clickedShape];
            setDragOffset({ x: x - element.x, y: y - element.y });
        } else if (clickedEmoji !== null) {
            console.log('Selected emoji:', clickedEmoji);
            setSelectedElement(clickedEmoji);
            setSelectedType('emoji');
            setIsDragging(true);
            const element = emojiElements[clickedEmoji];
            setDragOffset({ x: x - element.x, y: y - element.y });
        } else if (clickedText !== null) {
            console.log('Selected text:', clickedText);
            setSelectedElement(clickedText);
            setSelectedType('text');
            setIsDragging(true);
            const element = textElements[clickedText];
            setDragOffset({ x: x - element.x, y: y - element.y });
        } else {
            console.log('No element selected');
            setSelectedElement(null);
            setSelectedType('text');
        }
    };

    const handleCanvasMouseMove = (event) => {
        if (!isDragging || selectedElement === null) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);

        // Update position accounting for drag offset
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        // Keep within canvas bounds with some padding
        const padding = 20;
        const boundedX = Math.max(padding, Math.min(canvasSize.width - padding, newX));
        const boundedY = Math.max(padding, Math.min(canvasSize.height - padding, newY));

        updateSelectedElement('x', boundedX);
        updateSelectedElement('y', boundedY);
    };

    const handleCanvasMouseUp = (event) => {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
    };

    // Handle double click to add elements at position
    const handleCanvasDoubleClick = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);

        console.log('Double click at:', { x, y });

        if (activeTab === 0 && currentText.trim()) {
            // Add text
            const newElement = {
                text: currentText,
                x: x,
                y: y,
                fontSize,
                fontFamily,
                textColor,
                strokeColor,
                strokeWidth,
                isBold,
                isItalic,
                textShadow,
                textAlign,
                rotation: 0,
                opacity: 100
            };

            setTextElements([...textElements, newElement]);
            setSelectedElement(textElements.length);
            setSelectedType('text');
            setCurrentText('');
            saveToHistory();
        } else if (activeTab === 1) {
            // Add emoji
            const newElement = {
                emoji: selectedEmoji,
                x: x,
                y: y,
                size: emojiSize,
                opacity: 100,
                rotation: 0
            };

            setEmojiElements([...emojiElements, newElement]);
            setSelectedElement(emojiElements.length);
            setSelectedType('emoji');
            saveToHistory();
        } else if (activeTab === 3) {
            // Add sticker
            const newSticker = {
                emoji: selectedSticker,
                x: x,
                y: y,
                size: 64,
                opacity: 100,
                rotation: 0
            };

            setStickers([...stickers, newSticker]);
            setSelectedElement(stickers.length);
            setSelectedType('sticker');
            saveToHistory();
        }
    };

    // Export meme as base64
    const exportMeme = () => {
        const canvas = canvasRef.current;
        return canvas.toDataURL('image/jpeg', 0.9);
    };

    // Save meme
    const handleSave = () => {
        const memeDataUrl = exportMeme();
        onSave(memeDataUrl);
    };

    // Common text positions
    const positionPresets = [
        { name: 'Top', x: canvasSize.width / 2, y: fontSize + 20 },
        { name: 'Bottom', x: canvasSize.width / 2, y: canvasSize.height - 20 },
        { name: 'Center', x: canvasSize.width / 2, y: canvasSize.height / 2 }
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                🎨 Meme Editor
            </Typography>

            <Grid container spacing={3}>
                {/* Canvas Area */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onDoubleClick={handleCanvasDoubleClick}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                cursor: isDragging ? 'grabbing' : selectedElement !== null ? 'grab' : 'crosshair'
                            }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSave}
                                startIcon={<Save />}
                                sx={{ mr: 2 }}
                            >
                                Save Meme
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={onCancel}
                                sx={{ mr: 2 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                startIcon={<Undo />}
                                sx={{ mr: 1 }}
                            >
                                Undo
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                startIcon={<Redo />}
                            >
                                Redo
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Controls Panel */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            🎨 Meme Creator Tools
                        </Typography>

                        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ mb: 2 }}>
                            <Tab label="Text" icon={<TextFields />} />
                            <Tab label="Emojis" icon={<EmojiEmotions />} />
                            <Tab label="Effects" icon={<Palette />} />
                            <Tab label="Stickers" icon={<Star />} />
                            <Tab label="Shapes" icon={<Whatshot />} />
                            <Tab label="Templates" icon={<Visibility />} />
                        </Tabs>

                        {/* Text Tab */}
                        {activeTab === 0 && (
                            <Box>
                                {/* Add New Text */}
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <TextField
                                            fullWidth
                                            label="Text"
                                            value={currentText}
                                            onChange={(e) => setCurrentText(e.target.value)}
                                            placeholder="Enter meme text..."
                                            sx={{ mb: 2 }}
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={addTextElement}
                                            startIcon={<Add />}
                                            disabled={!currentText.trim()}
                                        >
                                            Add Text
                                        </Button>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                                            💡 Double-click canvas to place text at position
                                        </Typography>
                                    </CardContent>
                                </Card>

                                {/* Quick Position Buttons */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Quick Positions:
                                    </Typography>
                                    {positionPresets.map((preset) => (
                                        <Chip
                                            key={preset.name}
                                            label={preset.name}
                                            onClick={() => {
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('x', preset.x);
                                                    updateSelectedElement('y', preset.y);
                                                }
                                            }}
                                            disabled={selectedElement === null || selectedType !== 'text'}
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Font Settings */}
                                <Typography variant="subtitle2" gutterBottom>
                                    Font Settings:
                                </Typography>
                                
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Font Family</InputLabel>
                                    <Select
                                        value={fontFamily}
                                        onChange={(e) => {
                                            setFontFamily(e.target.value);
                                            if (selectedElement !== null && selectedType === 'text') {
                                                updateSelectedElement('fontFamily', e.target.value);
                                            }
                                        }}
                                    >
                                        <MenuItem value="Arial">Arial</MenuItem>
                                        <MenuItem value="Impact">Impact</MenuItem>
                                        <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
                                        <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                        <MenuItem value="Helvetica">Helvetica</MenuItem>
                                        <MenuItem value="Georgia">Georgia</MenuItem>
                                        <MenuItem value="Verdana">Verdana</MenuItem>
                                    </Select>
                                </FormControl>

                                <Typography gutterBottom>Font Size: {fontSize}px</Typography>
                                <Slider
                                    value={fontSize}
                                    min={12}
                                    max={120}
                                    onChange={(e, value) => {
                                        setFontSize(value);
                                        if (selectedElement !== null && selectedType === 'text') {
                                            updateSelectedElement('fontSize', value);
                                        }
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                {/* Text Style Presets */}
                                <Typography variant="subtitle2" gutterBottom>
                                    Quick Styles:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {textStylePresets.map((preset) => (
                                        <Chip
                                            key={preset.name}
                                            label={preset.name}
                                            onClick={() => applyTextPreset(preset)}
                                            sx={{ fontSize: '0.7rem' }}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>

                                {/* Style Toggles */}
                                <Box sx={{ mb: 2 }}>
                                    <ButtonGroup>
                                        <IconButton
                                            color={isBold ? 'primary' : 'default'}
                                            onClick={() => {
                                                setIsBold(!isBold);
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('isBold', !isBold);
                                                }
                                            }}
                                        >
                                            <FormatBold />
                                        </IconButton>
                                        <IconButton
                                            color={isItalic ? 'primary' : 'default'}
                                            onClick={() => {
                                                setIsItalic(!isItalic);
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('isItalic', !isItalic);
                                                }
                                            }}
                                        >
                                            <FormatItalic />
                                        </IconButton>
                                    </ButtonGroup>
                                </Box>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={textShadow}
                                            onChange={(e) => {
                                                setTextShadow(e.target.checked);
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('textShadow', e.target.checked);
                                                }
                                            }}
                                        />
                                    }
                                    label="Text Shadow"
                                    sx={{ mb: 2 }}
                                />

                                {/* Colors */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        label="Text Color"
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => {
                                            setTextColor(e.target.value);
                                            if (selectedElement !== null && selectedType === 'text') {
                                                updateSelectedElement('textColor', e.target.value);
                                            }
                                        }}
                                        sx={{ mr: 1, mb: 1, width: '48%' }}
                                    />
                                    <TextField
                                        label="Stroke Color"
                                        type="color"
                                        value={strokeColor}
                                        onChange={(e) => {
                                            setStrokeColor(e.target.value);
                                            if (selectedElement !== null && selectedType === 'text') {
                                                updateSelectedElement('strokeColor', e.target.value);
                                            }
                                        }}
                                        sx={{ width: '48%' }}
                                    />
                                </Box>

                                <Typography gutterBottom>Stroke Width: {strokeWidth}px</Typography>
                                <Slider
                                    value={strokeWidth}
                                    min={0}
                                    max={15}
                                    onChange={(e, value) => {
                                        setStrokeWidth(value);
                                        if (selectedElement !== null && selectedType === 'text') {
                                            updateSelectedElement('strokeWidth', value);
                                        }
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                {/* Advanced Text Controls */}
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>Advanced Controls</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Text Alignment</InputLabel>
                                            <Select
                                                value={textAlign}
                                                onChange={(e) => {
                                                    setTextAlign(e.target.value);
                                                    if (selectedElement !== null && selectedType === 'text') {
                                                        updateSelectedElement('textAlign', e.target.value);
                                                    }
                                                }}
                                            >
                                                <MenuItem value="left">Left</MenuItem>
                                                <MenuItem value="center">Center</MenuItem>
                                                <MenuItem value="right">Right</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Typography gutterBottom>Rotation: {textRotation}°</Typography>
                                        <Slider
                                            value={textRotation}
                                            min={-180}
                                            max={180}
                                            onChange={(e, value) => {
                                                setTextRotation(value);
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('rotation', value);
                                                }
                                            }}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography gutterBottom>Opacity: {textOpacity}%</Typography>
                                        <Slider
                                            value={textOpacity}
                                            min={0}
                                            max={100}
                                            onChange={(e, value) => {
                                                setTextOpacity(value);
                                                if (selectedElement !== null && selectedType === 'text') {
                                                    updateSelectedElement('opacity', value);
                                                }
                                            }}
                                            sx={{ mb: 2 }}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Emoji Tab */}
                        {activeTab === 1 && (
                            <Box>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Selected Emoji: {selectedEmoji}
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={addEmojiElement}
                                            startIcon={<Add />}
                                        >
                                            Add Emoji
                                        </Button>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                                            💡 Double-click canvas to place emoji
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Typography gutterBottom>Emoji Size: {emojiSize}px</Typography>
                                <Slider
                                    value={emojiSize}
                                    min={24}
                                    max={120}
                                    onChange={(e, value) => {
                                        setEmojiSize(value);
                                        if (selectedElement !== null && selectedType === 'emoji') {
                                            updateSelectedElement('size', value);
                                        }
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>😂 Popular Emojis</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {popularEmojis.map((emoji) => (
                                                <Button
                                                    key={emoji}
                                                    variant={selectedEmoji === emoji ? 'contained' : 'outlined'}
                                                    onClick={() => setSelectedEmoji(emoji)}
                                                    sx={{ minWidth: 40, fontSize: 20 }}
                                                >
                                                    {emoji}
                                                </Button>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mt: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>⭐ Icons & Symbols</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {iconEmojis.map((emoji) => (
                                                <Button
                                                    key={emoji}
                                                    variant={selectedEmoji === emoji ? 'contained' : 'outlined'}
                                                    onClick={() => setSelectedEmoji(emoji)}
                                                    sx={{ minWidth: 40, fontSize: 20 }}
                                                >
                                                    {emoji}
                                                </Button>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Effects Tab */}
                        {activeTab === 2 && (
                            <Box>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🎭 Image Effects
                                        </Typography>
                                        
                                        <Typography gutterBottom>Brightness: {imageEffects.brightness}%</Typography>
                                        <Slider
                                            value={imageEffects.brightness}
                                            min={0}
                                            max={200}
                                            onChange={(e, value) => updateImageEffect('brightness', value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography gutterBottom>Contrast: {imageEffects.contrast}%</Typography>
                                        <Slider
                                            value={imageEffects.contrast}
                                            min={0}
                                            max={200}
                                            onChange={(e, value) => updateImageEffect('contrast', value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography gutterBottom>Blur: {imageEffects.blur}px</Typography>
                                        <Slider
                                            value={imageEffects.blur}
                                            min={0}
                                            max={10}
                                            step={0.5}
                                            onChange={(e, value) => updateImageEffect('blur', value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography gutterBottom>Rotation: {imageEffects.rotation}°</Typography>
                                        <Slider
                                            value={imageEffects.rotation}
                                            min={-180}
                                            max={180}
                                            step={15}
                                            onChange={(e, value) => updateImageEffect('rotation', value)}
                                            sx={{ mb: 2 }}
                                        />

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={imageEffects.flipX}
                                                        onChange={(e) => updateImageEffect('flipX', e.target.checked)}
                                                    />
                                                }
                                                label="Flip X"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={imageEffects.flipY}
                                                        onChange={(e) => updateImageEffect('flipY', e.target.checked)}
                                                    />
                                                }
                                                label="Flip Y"
                                            />
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={resetImageEffects}
                                            startIcon={<Undo />}
                                        >
                                            Reset Effects
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Stickers Tab */}
                        {activeTab === 3 && (
                            <Box>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Selected Sticker: {selectedSticker}
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={addSticker}
                                            startIcon={<Add />}
                                        >
                                            Add Sticker
                                        </Button>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                                            💡 Double-click canvas to place sticker
                                        </Typography>
                                    </CardContent>
                                </Card>

                                {Object.entries(stickerCategories).map(([category, stickers]) => (
                                    <Accordion key={category}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography>{category}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {stickers.map((sticker) => (
                                                    <Button
                                                        key={sticker}
                                                        variant={selectedSticker === sticker ? 'contained' : 'outlined'}
                                                        onClick={() => setSelectedSticker(sticker)}
                                                        sx={{ minWidth: 40, fontSize: 20 }}
                                                    >
                                                        {sticker}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}

                        {/* Shapes Tab */}
                        {activeTab === 4 && (
                            <Box>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🔺 Add Shapes
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {drawingTools.map((tool) => (
                                                <Button
                                                    key={tool}
                                                    variant="outlined"
                                                    onClick={() => addShape(tool)}
                                                    sx={{ textTransform: 'capitalize' }}
                                                >
                                                    {tool}
                                                </Button>
                                            ))}
                                        </Box>

                                        <TextField
                                            label="Shape Color"
                                            type="color"
                                            value={shapeColor}
                                            onChange={(e) => setShapeColor(e.target.value)}
                                            sx={{ mr: 1, mb: 2, width: '48%' }}
                                        />

                                        <Typography gutterBottom>Shape Opacity: {shapeOpacity}%</Typography>
                                        <Slider
                                            value={shapeOpacity}
                                            min={0}
                                            max={100}
                                            onChange={(e, value) => setShapeOpacity(value)}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 5 && (
                            <Box>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📋 Meme Templates
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {memeTemplatePresets.map((template) => (
                                                <Button
                                                    key={template.name}
                                                    variant="outlined"
                                                    onClick={() => applyMemeTemplate(template)}
                                                    sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                                                >
                                                    {template.name}
                                                </Button>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography>🎨 Color Palettes</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {Object.entries(colorPalettes).map(([paletteName, colors]) => (
                                            <Box key={paletteName} sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {paletteName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {colors.map((color) => (
                                                        <Box
                                                            key={color}
                                                            sx={{
                                                                width: 30,
                                                                height: 30,
                                                                backgroundColor: color,
                                                                border: '1px solid #ccc',
                                                                cursor: 'pointer',
                                                                borderRadius: 1
                                                            }}
                                                            onClick={() => {
                                                                setTextColor(color);
                                                                if (selectedElement !== null && selectedType === 'text') {
                                                                    updateSelectedElement('textColor', color);
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Element Management */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Selected Element Controls:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={duplicateElement}
                                    disabled={selectedElement === null}
                                >
                                    Duplicate
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => moveLayer('up')}
                                    disabled={selectedElement === null}
                                >
                                    Layer ↑
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => moveLayer('down')}
                                    disabled={selectedElement === null}
                                >
                                    Layer ↓
                                </Button>
                            </Box>
                        </Box>

                        {/* Elements List */}
                        <Typography variant="subtitle2" gutterBottom>
                            Elements ({textElements.length + emojiElements.length + shapes.length + stickers.length}):
                        </Typography>
                        
                        {/* Text Elements */}
                        {textElements.map((element, index) => (
                            <Box
                                key={`text-${index}`}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    border: selectedElement === index && selectedType === 'text' ? '2px solid #1976d2' : '1px solid #ddd',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => {
                                    setSelectedElement(index);
                                    setSelectedType('text');
                                }}
                            >
                                <TextFields sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                    {element.text}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(index);
                                        setSelectedType('text');
                                        deleteSelectedElement();
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}

                        {/* Emoji Elements */}
                        {emojiElements.map((element, index) => (
                            <Box
                                key={`emoji-${index}`}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    border: selectedElement === index && selectedType === 'emoji' ? '2px solid #ff5722' : '1px solid #ddd',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => {
                                    setSelectedElement(index);
                                    setSelectedType('emoji');
                                }}
                            >
                                <EmojiEmotions sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ flex: 1, fontSize: 18 }}>
                                    {element.emoji}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(index);
                                        setSelectedType('emoji');
                                        deleteSelectedElement();
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}

                        {/* Shape Elements */}
                        {shapes.map((element, index) => (
                            <Box
                                key={`shape-${index}`}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    border: selectedElement === index && selectedType === 'shape' ? '2px solid #ff9800' : '1px solid #ddd',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => {
                                    setSelectedElement(index);
                                    setSelectedType('shape');
                                }}
                            >
                                <Whatshot sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                                    {element.type}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(index);
                                        setSelectedType('shape');
                                        deleteSelectedElement();
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}

                        {/* Sticker Elements */}
                        {stickers.map((element, index) => (
                            <Box
                                key={`sticker-${index}`}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    border: selectedElement === index && selectedType === 'sticker' ? '2px solid #9c27b0' : '1px solid #ddd',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => {
                                    setSelectedElement(index);
                                    setSelectedType('sticker');
                                }}
                            >
                                <Star sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ flex: 1, fontSize: 18 }}>
                                    {element.emoji}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElement(index);
                                        setSelectedType('sticker');
                                        deleteSelectedElement();
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}

                        {textElements.length === 0 && emojiElements.length === 0 && shapes.length === 0 && stickers.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No elements added yet. Add text, emojis, shapes, or stickers to get started!
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MemeEditor;
