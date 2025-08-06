// Quick test script to check collaboration status and test publishing
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCollaborations() {
    try {
        console.log('🔍 Testing collaboration endpoints...\n');
        
        // Test All Projects (should exclude drafts)
        console.log('1. Testing All Projects (should exclude drafts):');
        const allResponse = await axios.get(`${API_BASE}/collaborations?page=1&limit=12&sort=recent`);
        console.log(`   Found ${allResponse.data.collaborations?.length || 0} public collaborations`);
        allResponse.data.collaborations?.forEach(c => {
            console.log(`   - ${c.title} (${c.status}) by ${c.owner.username}`);
        });
        
        console.log('\n2. Testing Trending (should exclude drafts):');
        const trendingResponse = await axios.get(`${API_BASE}/collaborations/trending`);
        console.log(`   Found ${trendingResponse.data.data?.length || 0} trending collaborations`);
        trendingResponse.data.data?.forEach(c => {
            console.log(`   - ${c.title} (${c.status}) by ${c.owner.username}`);
        });
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testCollaborations();
