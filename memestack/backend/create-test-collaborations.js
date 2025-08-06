// Test script to create collaboration test data

const BASE_URL = 'http://localhost:5000/api';

async function createTestData() {
    try {
        console.log('🧪 Creating collaboration test data...');

        // First, login to get a token
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: 'test1@example.com',
                password: 'test123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('✅ Logged in successfully');

        // Create a test collaboration
        const collaborationData = {
            title: 'Funny Cat Meme Remix Challenge',
            description: 'Let\'s create hilarious variations of cat memes! Join this collaboration to add your own twist to classic cat memes.',
            type: 'collaboration',
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 10,
                allowAnonymous: false
            },
            tags: ['cats', 'funny', 'remix', 'animals']
        };

        const collabResponse = await fetch(`${BASE_URL}/collaborations`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(collaborationData)
        });
        
        if (collabResponse.ok) {
            const collabData = await collabResponse.json();
            console.log('✅ Created collaboration:', collabData.title);
        }

        // Create another collaboration
        const collaborationData2 = {
            title: 'Meme Template Creation Workshop',
            description: 'Collaborative effort to create new meme templates that everyone can use. Let\'s brainstorm and design together!',
            type: 'template_creation',
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 15,
                allowAnonymous: false
            },
            tags: ['templates', 'creative', 'design', 'community']
        };

        const collabResponse2 = await fetch(`${BASE_URL}/collaborations`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(collaborationData2)
        });
        
        if (collabResponse2.ok) {
            const collabData2 = await collabResponse2.json();
            console.log('✅ Created collaboration:', collabData2.title);
        }

        // Create a third collaboration with different status
        const collaborationData3 = {
            title: 'Reaction Meme Collection',
            description: 'Building the ultimate collection of reaction memes for every situation.',
            type: 'collaboration',
            status: 'active',
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: true,
                maxCollaborators: 8,
                allowAnonymous: false
            },
            tags: ['reactions', 'emotions', 'collection']
        };

        const collabResponse3 = await fetch(`${BASE_URL}/collaborations`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(collaborationData3)
        });
        
        if (collabResponse3.ok) {
            const collabData3 = await collabResponse3.json();
            console.log('✅ Created collaboration:', collabData3.title);
        }

        console.log('\n🎉 Test collaborations created successfully!');

    } catch (error) {
        console.error('❌ Error creating test data:', error.message);
    }
}

createTestData();
