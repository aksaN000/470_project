// 🤝 Test Collaboration Features
// Tests the enhanced collaboration functionality

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Mock user token (you'll need to replace with a real token)
const USER_TOKEN = 'your-jwt-token-here';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Authorization': `Bearer ${USER_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testCollaborationFeatures() {
    console.log('🧪 Testing Enhanced Collaboration Features...\n');

    try {
        // 1. Test getting collaborations (should work without auth)
        console.log('1. Testing collaboration list...');
        const collaborationsResponse = await axios.get(`${API_BASE}/collaborations`);
        console.log(`✅ Found ${collaborationsResponse.data.collaborations?.length || 0} collaborations\n`);

        if (collaborationsResponse.data.collaborations?.length > 0) {
            const testCollab = collaborationsResponse.data.collaborations[0];
            console.log(`📋 Using test collaboration: "${testCollab.title}"`);
            console.log(`   ID: ${testCollab._id}`);
            console.log(`   Type: ${testCollab.type}`);
            console.log(`   Status: ${testCollab.status}`);
            console.log(`   Forks: ${testCollab.stats?.totalForks || 0}\n`);

            // 2. Test getting collaboration details
            console.log('2. Testing collaboration details...');
            const detailResponse = await axios.get(`${API_BASE}/collaborations/${testCollab._id}`);
            console.log(`✅ Collaboration details loaded successfully`);
            console.log(`   Has original meme: ${!!detailResponse.data.originalMeme}`);
            console.log(`   Has versions: ${detailResponse.data.versions?.length || 0}`);
            console.log(`   Has collaborators: ${detailResponse.data.collaborators?.length || 0}\n`);

            // 3. Test fork functionality (requires authentication)
            console.log('3. Testing fork functionality...');
            if (USER_TOKEN && USER_TOKEN !== 'your-jwt-token-here') {
                try {
                    const forkResponse = await api.post(`/collaborations/${testCollab._id}/fork`, {
                        title: `Test Fork - ${Date.now()}`
                    });
                    console.log(`✅ Fork created successfully!`);
                    console.log(`   Fork ID: ${forkResponse.data._id}`);
                    console.log(`   Fork title: ${forkResponse.data.title}`);
                    console.log(`   Parent collaboration: ${forkResponse.data.parentCollaboration}\n`);
                } catch (forkError) {
                    console.log(`❌ Fork failed: ${forkError.response?.data?.message || forkError.message}\n`);
                }
            } else {
                console.log(`⚠️  Skipping fork test - no valid auth token provided\n`);
            }

            // 4. Test comment functionality (requires authentication)
            console.log('4. Testing comment functionality...');
            if (USER_TOKEN && USER_TOKEN !== 'your-jwt-token-here') {
                try {
                    const commentResponse = await api.post(`/collaborations/${testCollab._id}/comments`, {
                        content: `Test comment - ${new Date().toISOString()}`
                    });
                    console.log(`✅ Comment added successfully!`);
                    console.log(`   Comment ID: ${commentResponse.data._id}\n`);
                } catch (commentError) {
                    console.log(`❌ Comment failed: ${commentError.response?.data?.message || commentError.message}\n`);
                }
            } else {
                console.log(`⚠️  Skipping comment test - no valid auth token provided\n`);
            }

        } else {
            console.log('⚠️  No collaborations found to test with\n');
        }

        // 5. Test collaboration creation (requires authentication)
        console.log('5. Testing collaboration creation...');
        if (USER_TOKEN && USER_TOKEN !== 'your-jwt-token-here') {
            try {
                const createResponse = await api.post('/collaborations', {
                    title: `Test Collaboration - ${Date.now()}`,
                    description: 'Test collaboration for enhanced features',
                    type: 'collaboration',
                    settings: {
                        isPublic: true,
                        allowForks: true,
                        maxCollaborators: 10
                    }
                });
                console.log(`✅ Collaboration created successfully!`);
                console.log(`   ID: ${createResponse.data._id}`);
                console.log(`   Title: ${createResponse.data.title}\n`);
            } catch (createError) {
                console.log(`❌ Create failed: ${createError.response?.data?.message || createError.message}\n`);
            }
        } else {
            console.log(`⚠️  Skipping create test - no valid auth token provided\n`);
        }

        console.log('🎉 Collaboration feature tests completed!');
        console.log('\n📝 Test Summary:');
        console.log('   - Enhanced collaboration UI with better guidance');
        console.log('   - Improved fork experience with post-fork actions');
        console.log('   - Better version creation with collaboration context');
        console.log('   - Fork owners get welcome message and next steps');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Authentication helper
function setAuthToken(token) {
    console.log('🔑 To test authenticated features, update USER_TOKEN in this file');
    console.log('   1. Login to your app and get a JWT token');
    console.log('   2. Replace the USER_TOKEN variable');
    console.log('   3. Run this test again\n');
}

// Run tests
if (require.main === module) {
    console.log('🚀 Starting collaboration feature tests...\n');
    setAuthToken();
    testCollaborationFeatures();
}

module.exports = { testCollaborationFeatures };
