// Test script to verify fork functionality fixes
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFork() {
    try {
        console.log('🔧 Testing fork functionality...');
        
        // Get existing collaboration to fork
        const collabsResponse = await axios.get(`${API_BASE}/collaborations`);
        const collaborations = collabsResponse.data.collaborations;
        
        if (collaborations.length === 0) {
            console.log('❌ No collaborations found to test fork');
            return;
        }
        
        const collabToFork = collaborations[0];
        console.log(`📋 Found collaboration to fork: "${collabToFork.title}" (${collabToFork._id})`);
        
        // Test fork with empty title (should work now)
        console.log('🧪 Testing fork with empty title...');
        const emptyTitleResponse = await axios.post(`${API_BASE}/collaborations/${collabToFork._id}/fork`, {});
        console.log('✅ Fork with empty title successful:', emptyTitleResponse.data.title);
        
        // Test fork with valid title
        console.log('🧪 Testing fork with valid title...');
        const validTitleResponse = await axios.post(`${API_BASE}/collaborations/${collabToFork._id}/fork`, {
            title: 'Test Fork with Title'
        });
        console.log('✅ Fork with valid title successful:', validTitleResponse.data.title);
        
        // Test fork with too short title (should fail)
        console.log('🧪 Testing fork with too short title...');
        try {
            await axios.post(`${API_BASE}/collaborations/${collabToFork._id}/fork`, {
                title: 'ab'
            });
            console.log('❌ Expected validation error for short title');
        } catch (error) {
            console.log('✅ Validation working correctly for short title:', error.response?.data?.message);
        }
        
        console.log('🎉 Fork functionality tests completed!');
        
    } catch (error) {
        console.error('❌ Fork test failed:', error.response?.data || error.message);
    }
}

testFork();
