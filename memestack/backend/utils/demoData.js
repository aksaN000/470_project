// 🧪 Demo Data Creator
// Creates demo users and memes for testing the follow system

const User = require('../models/User');
const Meme = require('../models/Meme');

async function createDemoData() {
    try {
        console.log('🎭 Creating demo data...');

        // Demo users
        const demoUsers = [
            {
                username: 'meme_master',
                email: 'meme_master@test.com',
                password: 'demo123',
                profile: {
                    bio: 'I create the funniest memes on the internet! 😂',
                }
            },
            {
                username: 'reaction_queen',
                email: 'reaction_queen@test.com', 
                password: 'demo123',
                profile: {
                    bio: 'Reaction memes are my specialty 🎭',
                }
            },
            {
                username: 'gaming_guru',
                email: 'gaming_guru@test.com',
                password: 'demo123',
                profile: {
                    bio: 'Gaming memes and epic fails 🎮',
                }
            },
            {
                username: 'sports_star',
                email: 'sports_star@test.com',
                password: 'demo123',
                profile: {
                    bio: 'Sports memes and athletic humor ⚽',
                }
            }
        ];

        // Create users
        const createdUsers = [];
        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                const user = await User.create(userData);
                createdUsers.push(user);
                console.log(`✅ Created user: ${user.username}`);
            } else {
                createdUsers.push(existingUser);
                console.log(`♻️  User already exists: ${existingUser.username}`);
            }
        }

        // Demo memes
        const demoMemes = [
            {
                title: 'When you finally understand a programming joke',
                description: 'That moment of enlightenment 💡',
                category: 'funny',
                tags: ['programming', 'humor', 'relatable'],
                imageUrl: 'https://via.placeholder.com/500x400/FF6B6B/FFFFFF?text=Programming+Joke',
                thumbnailUrl: 'https://via.placeholder.com/250x200/FF6B6B/FFFFFF?text=Programming',
                creator: createdUsers[0]._id
            },
            {
                title: 'Me after watching one episode',
                description: 'Netflix recommendations be like...',
                category: 'reaction',
                tags: ['netflix', 'binge', 'relatable'],
                imageUrl: 'https://via.placeholder.com/500x400/4ECDC4/FFFFFF?text=Netflix+Binge',
                thumbnailUrl: 'https://via.placeholder.com/250x200/4ECDC4/FFFFFF?text=Netflix',
                creator: createdUsers[1]._id
            },
            {
                title: 'When the boss battle music starts',
                description: 'You know things are about to get real',
                category: 'gaming',
                tags: ['gaming', 'boss', 'epic'],
                imageUrl: 'https://via.placeholder.com/500x400/45B7D1/FFFFFF?text=Boss+Battle',
                thumbnailUrl: 'https://via.placeholder.com/250x200/45B7D1/FFFFFF?text=Gaming',
                creator: createdUsers[2]._id
            },
            {
                title: 'Monday morning workout motivation',
                description: 'The struggle is real',
                category: 'sports',
                tags: ['fitness', 'monday', 'motivation'],
                imageUrl: 'https://via.placeholder.com/500x400/96CEB4/FFFFFF?text=Workout+Motivation',
                thumbnailUrl: 'https://via.placeholder.com/250x200/96CEB4/FFFFFF?text=Fitness',
                creator: createdUsers[3]._id
            },
            {
                title: 'When your code works on the first try',
                description: 'Miracle of miracles!',
                category: 'funny',
                tags: ['programming', 'miracle', 'coding'],
                imageUrl: 'https://via.placeholder.com/500x400/FFEAA7/000000?text=Code+Works',
                thumbnailUrl: 'https://via.placeholder.com/250x200/FFEAA7/000000?text=Miracle',
                creator: createdUsers[0]._id
            },
            {
                title: 'That face when you see the bill',
                description: 'Instant regret mode activated',
                category: 'reaction',
                tags: ['money', 'regret', 'shopping'],
                imageUrl: 'https://via.placeholder.com/500x400/DDA0DD/FFFFFF?text=Expensive+Bill',
                thumbnailUrl: 'https://via.placeholder.com/250x200/DDA0DD/FFFFFF?text=Bill',
                creator: createdUsers[1]._id
            }
        ];

        // Create memes
        for (const memeData of demoMemes) {
            const existingMeme = await Meme.findOne({ title: memeData.title });
            if (!existingMeme) {
                const meme = await Meme.create(memeData);
                console.log(`✅ Created meme: ${meme.title}`);
                
                // Update creator stats
                await User.findByIdAndUpdate(meme.creator, {
                    $inc: { 'stats.memesCreated': 1 }
                });
            } else {
                console.log(`♻️  Meme already exists: ${existingMeme.title}`);
            }
        }

        console.log('🎉 Demo data creation completed!');
        console.log(`📊 Created ${createdUsers.length} users and ${demoMemes.length} memes`);
        
        return {
            users: createdUsers,
            memes: demoMemes.length
        };

    } catch (error) {
        console.error('❌ Error creating demo data:', error);
        throw error;
    }
}

module.exports = { createDemoData };
