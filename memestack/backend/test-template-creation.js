const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function testTemplateCreation() {
    try {
        console.log('🧪 Testing Template Creation...\n');

        // 1. Login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test1@example.com',
            password: 'test123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // 2. Test template creation (without actual image for now)
        console.log('\n2. Testing template creation endpoint...');
        
        // Create a simple text file as a mock image
        const mockImagePath = path.join(__dirname, 'mock-template.txt');
        fs.writeFileSync(mockImagePath, 'Mock template image content');
        
        const formData = new FormData();
        formData.append('name', 'Test Template');
        formData.append('category', 'popular');
        formData.append('description', 'A test template created via API');
        formData.append('isPublic', 'true');
        formData.append('image', fs.createReadStream(mockImagePath));

        const createResponse = await axios.post(`${BASE_URL}/templates`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('✅ Template creation response:', createResponse.data);

        // Clean up mock file
        fs.unlinkSync(mockImagePath);

        console.log('\n🎉 Template creation test completed successfully!');

    } catch (error) {
        console.error('❌ Error testing template creation:', error.response?.data || error.message);
    }
}

testTemplateCreation();
