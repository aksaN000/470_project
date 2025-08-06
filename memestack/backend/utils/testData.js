// Test data creator for development
const User = require('../models/User');
const Meme = require('../models/Meme');
const Follow = require('../models/Follow');
const Collaboration = require('../models/Collaboration');
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
            visibility: 'public',
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
            visibility: 'feed_only',
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
            visibility: 'gallery_only',
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

        // ========================================
        // CREATE SAMPLE TEMPLATES
        // ========================================
        console.log('🎨 Creating sample templates...');
        
        const MemeTemplate = require('../models/MemeTemplate');
        
        const template1 = new MemeTemplate({
            name: 'Drake Pointing',
            description: 'Classic Drake pointing meme template',
            category: 'reaction',
            imageUrl: 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Drake+Pointing',
            textAreas: [
                {
                    id: 'top_text',
                    x: 55, y: 25, width: 40, height: 20,
                    defaultText: 'Nah', placeholder: 'Top text',
                    fontSize: 32, fontFamily: 'Impact',
                    fontColor: '#000000', strokeColor: '#FFFFFF', strokeWidth: 1,
                    textAlign: 'left', verticalAlign: 'middle'
                },
                {
                    id: 'bottom_text',
                    x: 55, y: 70, width: 40, height: 20,
                    defaultText: 'Yeah', placeholder: 'Bottom text',
                    fontSize: 32, fontFamily: 'Impact',
                    fontColor: '#000000', strokeColor: '#FFFFFF', strokeWidth: 1,
                    textAlign: 'left', verticalAlign: 'middle'
                }
            ],
            createdBy: user1._id,
            isPublic: true,
            isOfficial: true,
            stats: { usageCount: 150, rating: 4.8, ratingCount: 45 },
            favoriteCount: 32, downloadCount: 89, usageCount: 150,
            averageRating: 4.8, ratingCount: 45, isActive: true,
            dimensions: { width: 400, height: 400 }
        });

        const template2 = new MemeTemplate({
            name: 'Distracted Boyfriend',
            description: 'Guy looking at another girl while his girlfriend looks on',
            category: 'reaction',
            imageUrl: 'https://via.placeholder.com/500x300/2a2a2a/ffffff?text=Distracted+Boyfriend',
            textAreas: [
                {
                    id: 'girlfriend',
                    x: 10, y: 80, width: 25, height: 15,
                    defaultText: 'Old thing', placeholder: 'Girlfriend label',
                    fontSize: 24, fontFamily: 'Impact',
                    fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2,
                    textAlign: 'center', verticalAlign: 'middle'
                },
                {
                    id: 'boyfriend',
                    x: 37, y: 80, width: 25, height: 15,
                    defaultText: 'Me', placeholder: 'Boyfriend label',
                    fontSize: 24, fontFamily: 'Impact',
                    fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2,
                    textAlign: 'center', verticalAlign: 'middle'
                },
                {
                    id: 'other_girl',
                    x: 75, y: 80, width: 25, height: 15,
                    defaultText: 'New thing', placeholder: 'Other girl label',
                    fontSize: 24, fontFamily: 'Impact',
                    fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2,
                    textAlign: 'center', verticalAlign: 'middle'
                }
            ],
            createdBy: user2._id,
            isPublic: true,
            isOfficial: true,
            stats: { usageCount: 230, rating: 4.9, ratingCount: 78 },
            favoriteCount: 56, downloadCount: 134, usageCount: 230,
            averageRating: 4.9, ratingCount: 78, isActive: true,
            dimensions: { width: 500, height: 300 }
        });

        const template3 = new MemeTemplate({
            name: 'Two Buttons',
            description: 'Sweating guy choosing between two buttons',
            category: 'reaction',
            imageUrl: 'https://via.placeholder.com/400x400/3a3a3a/ffffff?text=Two+Buttons',
            textAreas: [
                {
                    id: 'left_button',
                    x: 15, y: 35, width: 30, height: 20,
                    defaultText: 'Option A', placeholder: 'Left button',
                    fontSize: 20, fontFamily: 'Arial',
                    fontColor: '#000000', strokeColor: '#FFFFFF', strokeWidth: 1,
                    textAlign: 'center', verticalAlign: 'middle'
                },
                {
                    id: 'right_button',
                    x: 55, y: 35, width: 30, height: 20,
                    defaultText: 'Option B', placeholder: 'Right button',
                    fontSize: 20, fontFamily: 'Arial',
                    fontColor: '#000000', strokeColor: '#FFFFFF', strokeWidth: 1,
                    textAlign: 'center', verticalAlign: 'middle'
                }
            ],
            createdBy: user1._id,
            isPublic: true,
            isOfficial: true,
            stats: { usageCount: 89, rating: 4.5, ratingCount: 23 },
            favoriteCount: 18, downloadCount: 45, usageCount: 89,
            averageRating: 4.5, ratingCount: 23, isActive: true,
            dimensions: { width: 400, height: 400 }
        });

        await template1.save();
        await template2.save();
        await template3.save();
        
        console.log('🎨 New template created:', template1.name, 'by', user1.username);
        console.log('🎨 New template created:', template2.name, 'by', user2.username);
        console.log('🎨 New template created:', template3.name, 'by', user1.username);
        console.log('✅ Created 3 sample templates');

        // Create sample collaborations
        console.log('🤝 Creating sample collaborations...');

        const collaboration1 = new Collaboration({
            title: 'Epic Cat Remix Project',
            description: 'A fun collaboration to remix the funny cat meme with new captions',
            type: 'remix',
            owner: user1._id,
            originalMeme: meme1._id,
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 5,
                allowAnonymous: false
            },
            tags: ['funny', 'cats', 'remix'],
            status: 'active',
            stats: {
                totalViews: 45,
                totalContributors: 2,
                totalComments: 3,
                totalForks: 1
            }
        });

        const collaboration2 = new Collaboration({
            title: 'Gaming Meme Collaboration',
            description: 'Collaborative project to create the ultimate gaming meme',
            type: 'collaboration',
            owner: user2._id,
            originalMeme: meme2._id,
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: true,
                maxCollaborators: 8,
                allowAnonymous: false
            },
            tags: ['gaming', 'collab', 'epic'],
            status: 'active',
            stats: {
                totalViews: 78,
                totalContributors: 3,
                totalComments: 8,
                totalForks: 2
            }
        });

        const collaboration3 = new Collaboration({
            title: 'Reaction Meme Workshop',
            description: 'Open workshop for creating reaction memes',
            type: 'template_creation',
            owner: user1._id,
            originalMeme: meme3._id,
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 15,
                allowAnonymous: true
            },
            tags: ['reaction', 'template', 'workshop'],
            status: 'active',
            stats: {
                totalViews: 23,
                totalContributors: 1,
                totalComments: 1,
                totalForks: 0
            }
        });

        await collaboration1.save();
        await collaboration2.save();
        await collaboration3.save();

        console.log('🤝 New collaboration created:', collaboration1.title, 'by', user1.username);
        console.log('🤝 New collaboration created:', collaboration2.title, 'by', user2.username);
        console.log('🤝 New collaboration created:', collaboration3.title, 'by', user1.username);
        console.log('✅ Created 3 sample collaborations');

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
