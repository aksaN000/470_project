// Test data creator for development
const User = require('../models/User');
const Meme = require('../models/Meme');
const Follow = require('../models/Follow');
const bcrypt = require('bcryptjs');

async function createTestData() {
    try {
        console.log('🧪 Creating test data...');

        // Check if test data already exists
        const existingUser = await User.findOne({ email: 'test1@example.com' });
        if (existingUser) {
            console.log('📋 Test data already exists');
            return;
        }

        // Create test users
        const hashedPassword = await bcrypt.hash('test123', 12);
        
        const user1 = new User({
            username: 'creator1',
            email: 'test1@example.com',
            password: hashedPassword,
            profile: {
                displayName: 'Creative Creator',
                bio: 'I make amazing memes! 🎨',
                avatar: ''
            },
            isVerified: true
        });

        const user2 = new User({
            username: 'creator2', 
            email: 'test2@example.com',
            password: hashedPassword,
            profile: {
                displayName: 'Meme Master',
                bio: 'Meme specialist since 2020 😎',
                avatar: ''
            },
            isVerified: true
        });

        const user3 = new User({
            username: 'viewer',
            email: 'test3@example.com', 
            password: hashedPassword,
            profile: {
                displayName: 'Meme Lover',
                bio: 'I love good memes! ❤️',
                avatar: ''
            },
            isVerified: true
        });

        await Promise.all([user1.save(), user2.save(), user3.save()]);
        console.log('✅ Created 3 test users');

        // Create test memes
        const meme1 = new Meme({
            title: 'Funny Cat Meme',
            description: 'This cat is so funny!',
            imageUrl: 'https://via.placeholder.com/500x400/4CAF50/white?text=Cat+Meme+1',
            thumbnailUrl: 'https://via.placeholder.com/300x240/4CAF50/white?text=Cat+Meme+1',
            creator: user1._id,
            category: 'funny',
            tags: ['cat', 'funny', 'animal'],
            isPublic: true,
            metadata: {
                format: 'jpg',
                dimensions: { width: 500, height: 400 }
            }
        });

        const meme2 = new Meme({
            title: 'Gaming Meme',
            description: 'When you finally beat that boss!',
            imageUrl: 'https://via.placeholder.com/500x400/2196F3/white?text=Gaming+Meme+2',
            thumbnailUrl: 'https://via.placeholder.com/300x240/2196F3/white?text=Gaming+Meme+2',
            creator: user1._id,
            category: 'gaming',
            tags: ['gaming', 'victory', 'boss'],
            isPublic: true,
            metadata: {
                format: 'jpg',
                dimensions: { width: 500, height: 400 }
            }
        });

        const meme3 = new Meme({
            title: 'Reaction Meme',
            description: 'Perfect reaction for Monday mornings',
            imageUrl: 'https://via.placeholder.com/500x400/FF9800/white?text=Reaction+Meme+3',
            thumbnailUrl: 'https://via.placeholder.com/300x240/FF9800/white?text=Reaction+Meme+3',
            creator: user2._id,
            category: 'reaction',
            tags: ['reaction', 'monday', 'mood'],
            isPublic: true,
            metadata: {
                format: 'jpg',
                dimensions: { width: 500, height: 400 }
            }
        });

        await Promise.all([meme1.save(), meme2.save(), meme3.save()]);
        console.log('✅ Created 3 test memes');

        // Create follow relationships
        const follow1 = new Follow({
            follower: user3._id,  // viewer follows creator1
            following: user1._id
        });

        const follow2 = new Follow({
            follower: user3._id,  // viewer follows creator2
            following: user2._id
        });

        await Promise.all([follow1.save(), follow2.save()]);
        console.log('✅ Created follow relationships');

        // Update user stats
        await User.findByIdAndUpdate(user1._id, {
            $inc: { 'stats.followersCount': 1, 'stats.memesCreated': 2 }
        });

        await User.findByIdAndUpdate(user2._id, {
            $inc: { 'stats.followersCount': 1, 'stats.memesCreated': 1 }
        });

        await User.findByIdAndUpdate(user3._id, {
            $inc: { 'stats.followingCount': 2 }
        });

        console.log('✅ Updated user stats');
        console.log('🎉 Test data created successfully!');
        console.log('📧 Test accounts:');
        console.log('   - test1@example.com / test123 (creator1)');
        console.log('   - test2@example.com / test123 (creator2)');
        console.log('   - test3@example.com / test123 (viewer - follows both creators)');

    } catch (error) {
        console.error('❌ Error creating test data:', error);
    }
}

module.exports = { createTestData };
