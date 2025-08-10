const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Meme = require('./models/Meme');
const User = require('./models/User');

let mongod;

const connectDB = async () => {
    try {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('✅ Connected to in-memory MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
        process.exit(1);
    }
};

const createTestMemes = async () => {
    await connectDB();
    
    try {
        // Find test users
        const users = await User.find().limit(3);
        
        if (users.length === 0) {
            console.log('No users found. Please create users first.');
            return;
        }

        console.log('Found users:', users.map(u => u.email));

        // Sample meme data
        const sampleMemes = [
            {
                title: 'Funny Cat Meme',
                imageUrl: 'https://i.imgflip.com/1bij.jpg',
                tags: ['funny', 'cat', 'animal'],
                category: 'animals',
                isPublic: true
            },
            {
                title: 'Programming Humor',
                imageUrl: 'https://i.imgflip.com/25w3.jpg',
                tags: ['programming', 'humor', 'code'],
                category: 'humor',
                isPublic: true
            },
            {
                title: 'Reaction Meme',
                imageUrl: 'https://i.imgflip.com/30b1.jpg',
                tags: ['reaction', 'funny'],
                category: 'reactions',
                isPublic: true
            },
            {
                title: 'Study Motivation',
                imageUrl: 'https://i.imgflip.com/3lmzyx.jpg',
                tags: ['study', 'motivation', 'student'],
                category: 'educational',
                isPublic: true
            },
            {
                title: 'Weekend Vibes',
                imageUrl: 'https://i.imgflip.com/1otk96.jpg',
                tags: ['weekend', 'relax', 'fun'],
                category: 'lifestyle',
                isPublic: true
            }
        ];

        // Create memes for each user
        for (const user of users) {
            console.log(`Creating memes for user: ${user.email}`);
            
            for (const memeData of sampleMemes) {
                const meme = new Meme({
                    ...memeData,
                    title: `${memeData.title} - ${user.username}`,
                    author: user._id,
                    metadata: {
                        uploadedAt: new Date(),
                        fileSize: Math.floor(Math.random() * 1000000) + 100000, // Random file size
                        mimeType: 'image/jpeg',
                        dimensions: {
                            width: 800,
                            height: 600
                        }
                    },
                    stats: {
                        views: Math.floor(Math.random() * 100),
                        likes: Math.floor(Math.random() * 50),
                        downloads: Math.floor(Math.random() * 25),
                        shares: Math.floor(Math.random() * 10)
                    }
                });

                await meme.save();
                console.log(`✅ Created meme: ${meme.title}`);
            }
        }

        console.log('✅ Test memes created successfully!');
        
        // Check final count
        const totalMemes = await Meme.countDocuments();
        console.log(`Total memes in database: ${totalMemes}`);
        
    } catch (error) {
        console.error('❌ Error creating test memes:', error);
    } finally {
        await mongoose.connection.close();
        if (mongod) {
            await mongod.stop();
        }
    }
};

createTestMemes();
