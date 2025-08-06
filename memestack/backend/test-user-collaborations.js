// Test script to verify user collaborations functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testUserCollaborations() {
    try {
        console.log('🧪 Testing User Collaborations Fix...\n');

        // First, login to get a token
        console.log('1. Logging in as test user...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            identifier: 'creator1',
            password: 'test123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('🔑 Token received:', token ? 'Yes' : 'No');
        
        // Set up headers for authenticated requests
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Test getting user collaborations
        console.log('\n2. Testing getUserCollaborations endpoint...');
        const userCollabsResponse = await axios.get(`${API_BASE}/collaborations/user/collaborations`, { headers });
        
        console.log('✅ getUserCollaborations response received');
        console.log('📊 Response structure:', {
            hasSuccess: !!userCollabsResponse.data.success,
            hasCollaborations: !!userCollabsResponse.data.collaborations,
            collaborationsCount: userCollabsResponse.data.collaborations?.length || 0,
            responseKeys: Object.keys(userCollabsResponse.data)
        });
        
        // Show collaboration details
        if (userCollabsResponse.data.collaborations?.length > 0) {
            console.log('\n📋 User\'s collaborations:');
            userCollabsResponse.data.collaborations.forEach((collab, index) => {
                console.log(`   ${index + 1}. "${collab.title}" (${collab.status}) - Owner: ${collab.owner.username}`);
            });
        } else {
            console.log('\n⚠️  No collaborations found for user');
        }

        // Test creating a new collaboration
        console.log('\n3. Testing collaboration creation...');
        const newCollabData = {
            title: 'Test Collaboration from Script',
            description: 'This is a test collaboration created by the test script',
            type: 'collaboration',
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 10,
                allowAnonymous: false
            },
            tags: ['test', 'script']
        };

        const createResponse = await axios.post(`${API_BASE}/collaborations`, newCollabData, { headers });
        console.log('✅ New collaboration created:', createResponse.data.title);
        console.log('📄 Status:', createResponse.data.status);
        console.log('🔗 ID:', createResponse.data._id);

        // Test getting user collaborations again to see if it shows up
        console.log('\n4. Re-testing getUserCollaborations after creation...');
        const updatedUserCollabsResponse = await axios.get(`${API_BASE}/collaborations/user/collaborations`, { headers });
        
        console.log('📊 Updated response:', {
            collaborationsCount: updatedUserCollabsResponse.data.collaborations?.length || 0,
            newCollaborationFound: updatedUserCollabsResponse.data.collaborations?.some(c => c.title === newCollabData.title)
        });

        if (updatedUserCollabsResponse.data.collaborations?.length > 0) {
            console.log('\n📋 Updated user\'s collaborations:');
            updatedUserCollabsResponse.data.collaborations.forEach((collab, index) => {
                console.log(`   ${index + 1}. "${collab.title}" (${collab.status}) - Owner: ${collab.owner.username}`);
            });
        }

        console.log('\n🎉 Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('Full error:', error);
    }
}

testUserCollaborations();
