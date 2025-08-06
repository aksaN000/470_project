// 🎨 Sample Template Seeder
// Creates sample templates for testing

const mongoose = require('mongoose');
const path = require('path');

// Import models
const MemeTemplate = require('./models/MemeTemplate');
const User = require('./models/User');

async function createSampleTemplates() {
    try {
        console.log('🌱 Creating sample templates...');

        // Find a user to assign as creator
        const sampleUser = await User.findOne();
        if (!sampleUser) {
            console.log('❌ No users found. Please run the server first to create test users.');
            return;
        }

        console.log('👤 Using user:', sampleUser.username);

        // Sample templates data
        const templates = [
            {
                name: 'Drake Pointing',
                description: 'Classic Drake pointing meme template',
                category: 'reaction',
                imageUrl: 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Drake+Pointing',
                textAreas: [
                    {
                        id: 'top_text',
                        x: 55,
                        y: 25,
                        width: 40,
                        height: 20,
                        defaultText: 'Nah',
                        placeholder: 'Top text',
                        fontSize: 32,
                        fontFamily: 'Impact',
                        fontColor: '#000000',
                        strokeColor: '#FFFFFF',
                        strokeWidth: 1,
                        textAlign: 'left'
                    },
                    {
                        id: 'bottom_text',
                        x: 55,
                        y: 70,
                        width: 40,
                        height: 20,
                        defaultText: 'Yeah',
                        placeholder: 'Bottom text',
                        fontSize: 32,
                        fontFamily: 'Impact',
                        fontColor: '#000000',
                        strokeColor: '#FFFFFF',
                        strokeWidth: 1,
                        textAlign: 'left'
                    }
                ],
                createdBy: sampleUser._id,
                isPublic: true,
                isOfficial: true,
                stats: {
                    usageCount: 150,
                    rating: 4.8,
                    ratingCount: 45
                },
                ratings: [],
                favoriteCount: 32,
                downloadCount: 89,
                usageCount: 150,
                averageRating: 4.8,
                ratingCount: 45,
                isActive: true,
                dimensions: { width: 400, height: 400 }
            },
            {
                name: 'Distracted Boyfriend',
                description: 'Guy looking at another girl while his girlfriend looks on',
                category: 'reaction',
                imageUrl: 'https://via.placeholder.com/500x300/2a2a2a/ffffff?text=Distracted+Boyfriend',
                textAreas: [
                    {
                        id: 'girlfriend',
                        x: 10,
                        y: 80,
                        width: 25,
                        height: 15,
                        defaultText: 'Old thing',
                        placeholder: 'Girlfriend label',
                        fontSize: 24,
                        fontFamily: 'Impact',
                        fontColor: '#FFFFFF',
                        strokeColor: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    },
                    {
                        id: 'boyfriend',
                        x: 37,
                        y: 80,
                        width: 25,
                        height: 15,
                        defaultText: 'Me',
                        placeholder: 'Boyfriend label',
                        fontSize: 24,
                        fontFamily: 'Impact',
                        fontColor: '#FFFFFF',
                        strokeColor: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    },
                    {
                        id: 'other_girl',
                        x: 75,
                        y: 80,
                        width: 25,
                        height: 15,
                        defaultText: 'New thing',
                        placeholder: 'Other girl label',
                        fontSize: 24,
                        fontFamily: 'Impact',
                        fontColor: '#FFFFFF',
                        strokeColor: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    }
                ],
                createdBy: sampleUser._id,
                isPublic: true,
                isOfficial: true,
                stats: {
                    usageCount: 230,
                    rating: 4.9,
                    ratingCount: 78
                },
                ratings: [],
                favoriteCount: 56,
                downloadCount: 134,
                usageCount: 230,
                averageRating: 4.9,
                ratingCount: 78,
                isActive: true,
                dimensions: { width: 500, height: 300 }
            },
            {
                name: 'Two Buttons',
                description: 'Sweating guy choosing between two buttons',
                category: 'reaction',
                imageUrl: 'https://via.placeholder.com/400x400/3a3a3a/ffffff?text=Two+Buttons',
                textAreas: [
                    {
                        id: 'left_button',
                        x: 15,
                        y: 35,
                        width: 30,
                        height: 20,
                        defaultText: 'Option A',
                        placeholder: 'Left button',
                        fontSize: 20,
                        fontFamily: 'Arial',
                        fontColor: '#000000',
                        strokeColor: '#FFFFFF',
                        strokeWidth: 1,
                        textAlign: 'center'
                    },
                    {
                        id: 'right_button',
                        x: 55,
                        y: 35,
                        width: 30,
                        height: 20,
                        defaultText: 'Option B',
                        placeholder: 'Right button',
                        fontSize: 20,
                        fontFamily: 'Arial',
                        fontColor: '#000000',
                        strokeColor: '#FFFFFF',
                        strokeWidth: 1,
                        textAlign: 'center'
                    }
                ],
                createdBy: sampleUser._id,
                isPublic: true,
                isOfficial: true,
                stats: {
                    usageCount: 89,
                    rating: 4.5,
                    ratingCount: 23
                },
                ratings: [],
                favoriteCount: 18,
                downloadCount: 45,
                usageCount: 89,
                averageRating: 4.5,
                ratingCount: 23,
                isActive: true,
                dimensions: { width: 400, height: 400 }
            },
            {
                name: 'Change My Mind',
                description: 'Steven Crowder sitting at table with sign',
                category: 'opinion',
                imageUrl: 'https://via.placeholder.com/500x300/4a4a4a/ffffff?text=Change+My+Mind',
                textAreas: [
                    {
                        id: 'sign_text',
                        x: 20,
                        y: 60,
                        width: 60,
                        height: 25,
                        defaultText: 'Your controversial opinion',
                        placeholder: 'Sign text',
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fontColor: '#000000',
                        strokeColor: '#FFFFFF',
                        strokeWidth: 1,
                        textAlign: 'center'
                    }
                ],
                createdBy: sampleUser._id,
                isPublic: true,
                isOfficial: true,
                stats: {
                    usageCount: 67,
                    rating: 4.3,
                    ratingCount: 19
                },
                ratings: [],
                favoriteCount: 12,
                downloadCount: 34,
                usageCount: 67,
                averageRating: 4.3,
                ratingCount: 19,
                isActive: true,
                dimensions: { width: 500, height: 300 }
            },
            {
                name: 'This Is Fine',
                description: 'Dog sitting in burning room saying "This is fine"',
                category: 'reaction',
                imageUrl: 'https://via.placeholder.com/400x300/5a5a5a/ffffff?text=This+Is+Fine',
                textAreas: [
                    {
                        id: 'top_text',
                        x: 50,
                        y: 15,
                        width: 40,
                        height: 15,
                        defaultText: 'Everything is burning',
                        placeholder: 'Top text',
                        fontSize: 24,
                        fontFamily: 'Impact',
                        fontColor: '#FFFFFF',
                        strokeColor: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    },
                    {
                        id: 'bottom_text',
                        x: 50,
                        y: 80,
                        width: 40,
                        height: 15,
                        defaultText: 'This is fine',
                        placeholder: 'Bottom text',
                        fontSize: 24,
                        fontFamily: 'Impact',
                        fontColor: '#FFFFFF',
                        strokeColor: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    }
                ],
                createdBy: sampleUser._id,
                isPublic: true,
                isOfficial: true,
                stats: {
                    usageCount: 145,
                    rating: 4.7,
                    ratingCount: 38
                },
                ratings: [],
                favoriteCount: 29,
                downloadCount: 78,
                usageCount: 145,
                averageRating: 4.7,
                ratingCount: 38,
                isActive: true,
                dimensions: { width: 400, height: 300 }
            }
        ];

        // Clear existing templates
        await MemeTemplate.deleteMany({});
        console.log('🗑️ Cleared existing templates');

        // Create new templates
        const createdTemplates = await MemeTemplate.insertMany(templates);
        console.log(`✅ Created ${createdTemplates.length} sample templates`);

        // Display created templates
        createdTemplates.forEach((template, index) => {
            console.log(`   ${index + 1}. ${template.name} (${template.category})`);
        });

        console.log('\n🎉 Sample templates created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating sample templates:', error);
    }
}

// Run if called directly
if (require.main === module) {
    // Connect to database (assuming it's already running)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memestack-test')
        .then(() => {
            console.log('🔗 Connected to MongoDB');
            return createSampleTemplates();
        })
        .then(() => {
            mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB');
        })
        .catch(error => {
            console.error('💥 Error:', error);
            mongoose.disconnect();
        });
}

module.exports = createSampleTemplates;
