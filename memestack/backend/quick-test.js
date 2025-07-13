// Simple test to verify templates route is working
console.log('🧪 Testing template route loading...');

try {
    // Test dependencies
    console.log('1. Testing cloudinary utility...');
    const cloudinaryUtil = require('./utils/cloudinary');
    console.log('✅ Cloudinary utility loaded');

    console.log('2. Testing template controller...');
    const templateController = require('./controllers/templateController');
    console.log('✅ Template controller loaded');

    console.log('3. Testing template routes...');
    const templateRoutes = require('./routes/templates');
    console.log('✅ Template routes loaded');

    console.log('🎉 All template components loaded successfully!');
    console.log('📝 The /api/templates route should now be available when the server starts.');
    
} catch (error) {
    console.error('❌ Error loading template components:', error.message);
    console.error('Stack:', error.stack);
}

console.log('Test completed.');
process.exit(0);
