const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testTemplateAPI() {
    try {
        console.log('🧪 Testing Template API endpoints...\n');

        // 1. Test health check
        console.log('1. Testing health check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health:', health.data.message);

        // 2. Test get all templates (should work even without auth)
        console.log('\n2. Testing get all templates...');
        const templates = await axios.get(`${BASE_URL}/templates`);
        console.log('✅ Templates fetched:', templates.data.templates?.length || 0, 'templates');

        // 3. Test trending templates
        console.log('\n3. Testing trending templates...');
        const trending = await axios.get(`${BASE_URL}/templates/trending`);
        console.log('✅ Trending templates fetched:', trending.data.templates?.length || 0, 'templates');

        // 4. Login to test authenticated endpoints
        console.log('\n4. Testing login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test1@example.com',
            password: 'test123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Set auth header for subsequent requests
        const authConfig = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 5. Test get user's templates
        console.log('\n5. Testing get user templates...');
        const userTemplates = await axios.get(`${BASE_URL}/templates/my-templates`, authConfig);
        console.log('✅ User templates fetched:', userTemplates.data.templates?.length || 0, 'templates');

        // 6. Test get favorite templates
        console.log('\n6. Testing get favorite templates...');
        const favorites = await axios.get(`${BASE_URL}/templates/favorites`, authConfig);
        console.log('✅ Favorite templates fetched:', favorites.data.templates?.length || 0, 'templates');

        console.log('\n🎉 All template API endpoints are working!');

    } catch (error) {
        console.error('❌ Error testing template API:', error.response?.data || error.message);
    }
}

testTemplateAPI();
