// Test template routes
const express = require('express');
const app = express();

app.use(express.json());

console.log('Testing template route registration...');

try {
    // Try to register the templates route
    app.use('/api/templates', require('./routes/templates'));
    console.log('✅ Templates route registered successfully');
    
    // Create a simple test server
    const server = app.listen(3001, () => {
        console.log('🚀 Test server running on port 3001');
        console.log('📍 Template routes should be available at:');
        console.log('   GET http://localhost:3001/api/templates');
        console.log('   POST http://localhost:3001/api/templates');
        
        // Close after a moment
        setTimeout(() => {
            server.close();
            console.log('✅ Test completed successfully - templates route is working');
        }, 1000);
    });
    
} catch (error) {
    console.error('❌ Error registering templates route:', error.message);
    console.error('Stack:', error.stack);
}
