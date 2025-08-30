// 🧪 Test Data Setup
// This file creates initial test data for development and testing

const User = require('../models/User');
const Meme = require('../models/Meme');

const createTestData = async () => {
    try {
        console.log('🧪 Creating test data...');

        // Check if test data already exists
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('✅ Test data already exists, skipping creation');
            return;
        }

        // Create test users
        const testUsers = [
            {
                username: 'testuser1',
                email: 'test1@example.com',
                password: 'password123',
                profile: {
                    displayName: 'Test User 1',
                    bio: 'A test user for development'
                }
            },
            {
                username: 'testuser2',
                email: 'test2@example.com',
                password: 'password123',
                profile: {
                    displayName: 'Test User 2',
                    bio: 'Another test user'
                }
            }
        ];

        for (const userData of testUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created test user: ${userData.username}`);
        }

        // Create test memes
        const testMemes = [
            {
                title: 'Welcome to MemeStack!',
                description: 'First test meme',
                imageUrl: 'https://via.placeholder.com/400x300?text=Test+Meme+1',
                category: 'funny',
                tags: ['test', 'welcome'],
                creator: (await User.findOne({ username: 'testuser1' }))._id
            },
            {
                title: 'Development Mode',
                description: 'Testing meme functionality',
                imageUrl: 'https://via.placeholder.com/400x300?text=Test+Meme+2',
                category: 'reaction',
                tags: ['test', 'development'],
                creator: (await User.findOne({ username: 'testuser2' }))._id
            }
        ];

        for (const memeData of testMemes) {
            const meme = new Meme(memeData);
            await meme.save();
            console.log(`✅ Created test meme: ${memeData.title}`);
        }

        console.log('🎉 Test data creation completed successfully');

    } catch (error) {
        console.error('❌ Error creating test data:', error.message);
        // Don't throw error to prevent server startup failure
    }
};

module.exports = { createTestData };
