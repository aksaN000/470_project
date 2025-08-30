// Quick test to verify template comment functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testTemplateComments() {
    try {
        console.log('🧪 Testing Template Comment Functionality...\n');
        
        // 1. Get templates to find a template ID
        console.log('1. Fetching templates...');
        const templatesResponse = await axios.get(`${API_BASE}/templates`);
        
        if (!templatesResponse.data.success || !templatesResponse.data.templates.length) {
            console.log('❌ No templates found. Cannot test comments.');
            return;
        }
        
        const templateId = templatesResponse.data.templates[0]._id;
        console.log(`✅ Found template: ${templateId}`);
        
        // 2. Test getting comments for the template (should work without auth)
        console.log('\n2. Testing GET comments...');
        const commentsResponse = await axios.get(`${API_BASE}/templates/${templateId}/comments`);
        
        if (commentsResponse.data.success) {
            console.log(`✅ GET comments successful. Found ${commentsResponse.data.data.comments.length} comments`);
        } else {
            console.log('❌ GET comments failed:', commentsResponse.data.message);
        }
        
        // 3. Test template by ID (to ensure route doesn't conflict)
        console.log('\n3. Testing GET template by ID...');
        const templateResponse = await axios.get(`${API_BASE}/templates/${templateId}`);
        
        if (templateResponse.data.success) {
            console.log(`✅ GET template by ID successful: ${templateResponse.data.data.name}`);
        } else {
            console.log('❌ GET template by ID failed:', templateResponse.data.message);
        }
        
        console.log('\n🎉 Template comment API tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.status === 404) {
            console.log('💡 This might be a "Template not found" error - check if the parameter name is correct');
        }
    }
}

// Run the test
testTemplateComments();
