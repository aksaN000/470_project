import React, { useState } from 'react';
import { Container, Typography, TextField, Box, Button } from '@mui/material';

const TestForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleTitleChange = (e) => {
        const value = e.target.value;
        console.log('Title changing to:', value);
        setTitle(value);
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        console.log('Description changing to:', value);
        setDescription(value);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Form Input Test - Simple Version
            </Typography>
            
            <Box sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Title (Simple State)"
                    value={title}
                    onChange={handleTitleChange}
                    margin="normal"
                    autoComplete="off"
                    placeholder="Type here..."
                />
                
                <TextField
                    fullWidth
                    label="Description (Simple State)"
                    value={description}
                    onChange={handleDescriptionChange}
                    margin="normal"
                    multiline
                    rows={4}
                    autoComplete="off"
                    placeholder="Type description here..."
                />
                
                <Button 
                    variant="contained" 
                    onClick={() => {
                        console.log('Current values:', { title, description });
                        alert(`Title: ${title}\nDescription: ${description}`);
                    }}
                    sx={{ mt: 2 }}
                >
                    Test Values
                </Button>
                
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        setTitle('');
                        setDescription('');
                    }}
                    sx={{ mt: 2, ml: 2 }}
                >
                    Clear
                </Button>
            </Box>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6">Real-time Display:</Typography>
                <Typography><strong>Title:</strong> "{title}"</Typography>
                <Typography><strong>Description:</strong> "{description}"</Typography>
                <Typography><strong>Title Length:</strong> {title.length}</Typography>
                <Typography><strong>Description Length:</strong> {description.length}</Typography>
            </Box>
        </Container>
    );
};

export default TestForm;
