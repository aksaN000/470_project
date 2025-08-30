// Quick test to verify meme comment functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testMemeComments() {
    try {
        console.log('🧪 Testing Meme Comment Functionality...\n');
        
        // 1. Get memes to find a meme ID
        console.log('1. Fetching memes...');
        const memesResponse = await axios.get(`${API_BASE}/memes`);
        
        if (!memesResponse.data.success || !memesResponse.data.data.memes.length) {
            console.log('❌ No memes found. Cannot test comments.');
            return;
        }
        
        const memeId = memesResponse.data.data.memes[0].id;
        console.log(`✅ Found meme: ${memeId}`);
        
        // 2. Test getting comments for the meme (should work without auth)
        console.log('\n2. Testing GET meme comments...');
        const commentsResponse = await axios.get(`${API_BASE}/comments/memes/${memeId}/comments`);
        
        if (commentsResponse.data.success) {
            console.log(`✅ GET meme comments successful. Found ${commentsResponse.data.data.comments.length} comments`);
        } else {
            console.log('❌ GET meme comments failed:', commentsResponse.data.message);
        }
        
        // 3. Test meme by ID (to ensure route doesn't conflict)
        console.log('\n3. Testing GET meme by ID...');
        const memeResponse = await axios.get(`${API_BASE}/memes/${memeId}`);
        
        if (memeResponse.data.success) {
            console.log(`✅ GET meme by ID successful: ${memeResponse.data.data.title}`);
        } else {
            console.log('❌ GET meme by ID failed:', memeResponse.data.message);
        }
        
        console.log('\n🎉 Meme comment API tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.status === 404) {
            console.log('💡 This might be a "Meme not found" error - check if the parameter name is correct');
        }
    }
}

// Run the test
testMemeComments().catch(console.error);
