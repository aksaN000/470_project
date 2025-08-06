#!/usr/bin/env node
// 🧪 Complete Collaboration System Test
// Tests all collaboration features to identify what's working and what needs completion

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const USER_TOKEN = ''; // Update this with a valid JWT token for authenticated tests

// Test user credentials for registration/login
const timestamp = Date.now();
const testUsers = [
    {
        username: `collab_user1_${timestamp}`,
        email: `collab1_${timestamp}@example.com`,
        password: 'testpass123',
        profile: { displayName: 'Collaboration Tester 1' }
    },
    {
        username: `collab_user2_${timestamp}`, 
        email: `collab2_${timestamp}@example.com`,
        password: 'testpass123',
        profile: { displayName: 'Collaboration Tester 2' }
    }
];

let authTokens = [];
let testCollaborationId = null;

// Helper to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (options.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${options.token}`;
        delete options.token;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`${response.status}: ${data.message || 'Request failed'}`);
    }
    
    return data;
};

// Test user authentication
const testUserAuth = async () => {
    console.log('🔐 Testing user authentication...');
    
    for (let i = 0; i < testUsers.length; i++) {
        const userData = testUsers[i];
        
        try {
            // Try to register user
            const registerResponse = await makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            console.log(`✅ User ${userData.username} registered successfully`);
            authTokens[i] = registerResponse.data?.token || registerResponse.token;
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('User already exists')) {
                // User exists, try to login
                try {
                    const loginResponse = await makeRequest('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: userData.email,
                            password: userData.password
                        })
                    });
                    console.log(`✅ User ${userData.username} logged in successfully`);
                    authTokens[i] = loginResponse.data?.token || loginResponse.token;
                } catch (loginError) {
                    console.error(`❌ Failed to login user ${userData.username}:`, loginError.message);
                    return false;
                }
            } else {
                console.error(`❌ Failed to register user ${userData.username}:`, error.message);
                return false;
            }
        }
    }
    
    return authTokens.length >= 2;
};

// Test basic collaboration endpoints
const testBasicEndpoints = async () => {
    console.log('\n📋 Testing basic collaboration endpoints...');
    
    try {
        // Test public collaboration list
        const collaborations = await makeRequest('/collaborations');
        console.log(`✅ Collaboration list: ${collaborations.collaborations?.length || 0} collaborations found`);
        
        // Test trending collaborations
        const trending = await makeRequest('/collaborations/trending');
        console.log(`✅ Trending collaborations: ${trending.data?.length || 0} trending found`);
        
        if (collaborations.collaborations?.length > 0) {
            const firstCollab = collaborations.collaborations[0];
            testCollaborationId = firstCollab._id;
            
            // Test collaboration detail
            const detail = await makeRequest(`/collaborations/${testCollaborationId}`);
            console.log(`✅ Collaboration detail loaded: "${detail.title}"`);
            console.log(`   - Owner: ${detail.owner.username}`);
            console.log(`   - Collaborators: ${detail.collaborators?.length || 0}`);
            console.log(`   - Pending Invites: ${detail.pendingInvites?.length || 0}`);
            console.log(`   - Versions: ${detail.versions?.length || 0}`);
            console.log(`   - Comments: ${detail.comments?.length || 0}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Basic endpoints failed:', error.message);
        return false;
    }
};

// Test collaboration creation
const testCollaborationCreation = async () => {
    console.log('\n➕ Testing collaboration creation...');
    
    if (!authTokens[0]) {
        console.log('⚠️  Skipping - no auth token available');
        return false;
    }
    
    try {
        const collaborationData = {
            title: 'Test Collaboration System',
            description: 'Testing all collaboration features comprehensively',
            type: 'collaboration',
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 10,
                allowAnonymous: false
            },
            tags: ['test', 'collaboration', 'system']
        };
        
        const response = await makeRequest('/collaborations', {
            method: 'POST',
            token: authTokens[0],
            body: JSON.stringify(collaborationData)
        });
        
        console.log(`✅ Collaboration created: "${response.title}" (ID: ${response._id})`);
        testCollaborationId = response._id;
        return true;
    } catch (error) {
        console.error('❌ Collaboration creation failed:', error.message);
        return false;
    }
};

// Test collaboration management features
const testCollaborationManagement = async () => {
    console.log('\n🛠️  Testing collaboration management...');
    
    if (!authTokens[0] || !authTokens[1] || !testCollaborationId) {
        console.log('⚠️  Skipping - missing requirements');
        return false;
    }
    
    try {
        // Test invitation system
        console.log('📧 Testing invitation system...');
        const inviteResponse = await makeRequest(`/collaborations/${testCollaborationId}/invite`, {
            method: 'POST',
            token: authTokens[0],
            body: JSON.stringify({
                username: testUsers[1].username,
                role: 'contributor',
                message: 'Join our test collaboration!'
            })
        });
        console.log('✅ Invitation sent successfully');
        
        // Test getting pending invites
        const pendingInvites = await makeRequest('/collaborations/user/invites', {
            token: authTokens[1]
        });
        console.log(`✅ Pending invites retrieved: ${pendingInvites.length || 0} invites`);
        
        // Test accepting invite
        if (pendingInvites.length > 0) {
            await makeRequest(`/collaborations/${testCollaborationId}/invites/accept`, {
                method: 'POST',
                token: authTokens[1]
            });
            console.log('✅ Invite accepted successfully');
        }
        
        // Test joining collaboration (alternative method)
        try {
            await makeRequest(`/collaborations/${testCollaborationId}/join`, {
                method: 'POST',
                token: authTokens[1],
                body: JSON.stringify({ message: 'Please let me join!' })
            });
            console.log('✅ Direct join successful');
        } catch (error) {
            console.log('ℹ️  Direct join not needed (already member)');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Management tests failed:', error.message);
        return false;
    }
};

// Test version creation and comments
const testVersionsAndComments = async () => {
    console.log('\n📝 Testing versions and comments...');
    
    if (!authTokens[0] || !testCollaborationId) {
        console.log('⚠️  Skipping - missing requirements');
        return false;
    }
    
    try {
        // Create a test meme first (needed for version creation)
        const memeData = {
            title: 'Test Collaboration Meme',
            description: 'A test meme for collaboration version',
            category: 'funny',
            imageUrl: 'https://via.placeholder.com/500x400/00FF00/white?text=Test+Meme',
            tags: ['test', 'collaboration']
        };
        
        const memeResponse = await makeRequest('/memes', {
            method: 'POST',
            token: authTokens[0],
            body: JSON.stringify(memeData)
        });
        
        console.log('📋 Meme response:', JSON.stringify(memeResponse, null, 2));
        const memeId = memeResponse.data?.meme?.id || memeResponse.data?.meme?._id || memeResponse.meme?.id || memeResponse.meme?._id || memeResponse._id || memeResponse.id;
        console.log(`✅ Test meme created: ${memeId}`);
        
        // Test version creation
        const versionData = {
            title: 'Version 1.0',
            memeId: memeId,
            description: 'First test version of the collaboration',
            changes: [
                {
                    type: 'element_add',
                    description: 'Added initial content',
                    previousValue: null,
                    newValue: 'Initial meme content'
                },
                {
                    type: 'style_change',
                    description: 'Set up base structure',
                    previousValue: null,
                    newValue: 'Base styling applied'
                }
            ]
        };
        
        // Debug: Check collaboration ownership
        const collabCheck = await makeRequest(`/collaborations/${testCollaborationId}`, {
            token: authTokens[0]
        });
        console.log(`📋 Collaboration owner: ${collabCheck.owner._id}`);
        console.log(`📋 Current user ID from token 0: (debugging...)`);
        
        try {
            await makeRequest(`/collaborations/${testCollaborationId}/versions`, {
                method: 'POST',
                token: authTokens[0],
                body: JSON.stringify(versionData)
            });
            console.log('✅ Version created successfully');
        } catch (versionError) {
            console.error('🔍 Version creation debug info:', {
                collaborationId: testCollaborationId,
                ownerId: collabCheck.owner._id,
                versionData
            });
            throw versionError;
        }
        
        // Test comment addition
        const commentData = {
            content: 'This is a test comment on the collaboration!'
        };
        
        await makeRequest(`/collaborations/${testCollaborationId}/comments`, {
            method: 'POST',
            token: authTokens[0],
            body: JSON.stringify(commentData)
        });
        console.log('✅ Comment added successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Versions/comments tests failed:', error.message);
        return false;
    }
};

// Test fork functionality
const testForkFeature = async () => {
    console.log('\n🍴 Testing fork functionality...');
    
    if (!authTokens[1] || !testCollaborationId) {
        console.log('⚠️  Skipping - missing requirements');
        return false;
    }
    
    try {
        const forkData = {
            title: 'Forked Test Collaboration'
        };
        
        const forkResponse = await makeRequest(`/collaborations/${testCollaborationId}/fork`, {
            method: 'POST',
            token: authTokens[1],
            body: JSON.stringify(forkData)
        });
        
        console.log(`✅ Fork created: "${forkResponse.title}" (ID: ${forkResponse._id})`);
        return true;
    } catch (error) {
        console.error('❌ Fork test failed:', error.message);
        return false;
    }
};

// Test role management
const testRoleManagement = async () => {
    console.log('\n👥 Testing role management...');
    
    if (!authTokens[0] || !testCollaborationId) {
        console.log('⚠️  Skipping - missing requirements');
        return false;
    }
    
    try {
        // Get collaboration to find collaborators
        const collaboration = await makeRequest(`/collaborations/${testCollaborationId}`, {
            token: authTokens[0]
        });
        
        if (collaboration.collaborators?.length > 0) {
            const collaboratorId = collaboration.collaborators[0].user._id;
            
            // Test role update
            await makeRequest(`/collaborations/${testCollaborationId}/collaborators/${collaboratorId}/role`, {
                method: 'PUT',
                token: authTokens[0],
                body: JSON.stringify({ role: 'editor' })
            });
            console.log('✅ Collaborator role updated successfully');
            
            // Could test removing collaborator, but let's keep them for other tests
        } else {
            console.log('ℹ️  No collaborators to manage');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Role management test failed:', error.message);
        return false;
    }
};

// Main test runner
const runCompleteTests = async () => {
    console.log('🚀 Starting Complete Collaboration System Tests...\n');
    
    const testResults = {
        userAuth: false,
        basicEndpoints: false,
        collaborationCreation: false,
        collaborationManagement: false,
        versionsAndComments: false,
        forkFeature: false,
        roleManagement: false
    };
    
    // Run all tests
    testResults.userAuth = await testUserAuth();
    testResults.basicEndpoints = await testBasicEndpoints();
    testResults.collaborationCreation = await testCollaborationCreation();
    testResults.collaborationManagement = await testCollaborationManagement();
    testResults.versionsAndComments = await testVersionsAndComments();
    testResults.forkFeature = await testForkFeature();
    testResults.roleManagement = await testRoleManagement();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    Object.entries(testResults).forEach(([testName, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        const formattedName = testName.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${formattedName}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log('=' .repeat(50));
    console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All collaboration features are working correctly!');
    } else {
        console.log('🔧 Some features need attention. Check the failed tests above.');
    }
};

// Run the tests
runCompleteTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
});
