// Quick test to check if templates route is working
const express = require('express');
const app = express();

// Test if we can require the templates route
try {
    const templatesRoute = require('./routes/templates');
    console.log('✅ Templates route loaded successfully');
    
    // Test if we can require the controller
    const templateController = require('./controllers/templateController');
    console.log('✅ Template controller loaded successfully');
    
    // Test if we can require the model
    const MemeTemplate = require('./models/MemeTemplate');
    console.log('✅ MemeTemplate model loaded successfully');
    
    console.log('🎉 All template dependencies are working!');
    
} catch (error) {
    console.error('❌ Error loading template dependencies:', error.message);
    console.error('Stack:', error.stack);
}
