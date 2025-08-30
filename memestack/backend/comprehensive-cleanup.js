// 🧹 Comprehensive Image Cleanup Script
// Cleans up broken image URLs from memes, templates, and user profiles

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('💡 Make sure your .env file has MONGODB_URI set');
        process.exit(1);
    }
};

// Define all schemas
const memeSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    thumbnailUrl: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'memes' });

const templateSchema = new mongoose.Schema({
    title: String,
    name: String,
    imageUrl: String,
    category: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'templates' });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    profile: {
        avatar: String,
        displayName: String,
        bio: String
    },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const Meme = mongoose.model('Meme', memeSchema);
const Template = mongoose.model('Template', templateSchema);
const User = mongoose.model('User', userSchema);

// Helper function to check if URL is broken
const isBrokenUrl = (url) => {
    if (!url) return false;
    return (
        url.includes('localhost:5000') ||
        url.includes('470-project.vercel.app/uploads') ||
        url.startsWith('/uploads')
    );
};

const cleanUpMemes = async () => {
    console.log('\n🖼️  Checking MEMES collection...');
    
    const brokenMemes = await Meme.find({
        $or: [
            { imageUrl: { $regex: 'localhost:5000' } },
            { imageUrl: { $regex: '470-project.vercel.app/uploads' } },
            { imageUrl: { $regex: '^/uploads' } }
        ]
    });
    
    console.log(`📊 Found ${brokenMemes.length} memes with broken image URLs`);
    
    if (brokenMemes.length > 0) {
        console.log('📋 Broken memes:');
        brokenMemes.forEach((meme, index) => {
            console.log(`  ${index + 1}. "${meme.title}" - ${meme.imageUrl}`);
        });
        
        const brokenMemeIds = brokenMemes.map(meme => meme._id);
        const deleteResult = await Meme.deleteMany({ _id: { $in: brokenMemeIds } });
        console.log(`🗑️  DELETED ${deleteResult.deletedCount} broken memes`);
    } else {
        console.log('✅ No broken memes found');
    }
};

const cleanUpTemplates = async () => {
    console.log('\n🎨 Checking TEMPLATES collection...');
    
    const brokenTemplates = await Template.find({
        $or: [
            { imageUrl: { $regex: 'localhost:5000' } },
            { imageUrl: { $regex: '470-project.vercel.app/uploads' } },
            { imageUrl: { $regex: '^/uploads' } }
        ]
    });
    
    console.log(`📊 Found ${brokenTemplates.length} templates with broken image URLs`);
    
    if (brokenTemplates.length > 0) {
        console.log('📋 Broken templates:');
        brokenTemplates.forEach((template, index) => {
            console.log(`  ${index + 1}. "${template.title || template.name}" - ${template.imageUrl}`);
        });
        
        const brokenTemplateIds = brokenTemplates.map(template => template._id);
        const deleteResult = await Template.deleteMany({ _id: { $in: brokenTemplateIds } });
        console.log(`🗑️  DELETED ${deleteResult.deletedCount} broken templates`);
    } else {
        console.log('✅ No broken templates found');
    }
};

const cleanUpUserAvatars = async () => {
    console.log('\n👤 Checking USER avatars...');
    
    const usersWithBrokenAvatars = await User.find({
        $or: [
            { 'profile.avatar': { $regex: 'localhost:5000' } },
            { 'profile.avatar': { $regex: '470-project.vercel.app/uploads' } },
            { 'profile.avatar': { $regex: '^/uploads' } }
        ]
    });
    
    console.log(`📊 Found ${usersWithBrokenAvatars.length} users with broken avatar URLs`);
    
    if (usersWithBrokenAvatars.length > 0) {
        console.log('📋 Users with broken avatars:');
        usersWithBrokenAvatars.forEach((user, index) => {
            console.log(`  ${index + 1}. "${user.username}" - ${user.profile?.avatar}`);
        });
        
        // Instead of deleting users, just clear their broken avatar URLs
        const updateResult = await User.updateMany(
            {
                $or: [
                    { 'profile.avatar': { $regex: 'localhost:5000' } },
                    { 'profile.avatar': { $regex: '470-project.vercel.app/uploads' } },
                    { 'profile.avatar': { $regex: '^/uploads' } }
                ]
            },
            { $unset: { 'profile.avatar': 1 } }
        );
        console.log(`🔧 CLEARED avatar URLs for ${updateResult.modifiedCount} users`);
    } else {
        console.log('✅ No broken user avatars found');
    }
};

const getCollectionCounts = async () => {
    console.log('\n📊 Final collection counts:');
    const memeCount = await Meme.countDocuments();
    const templateCount = await Template.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`  🖼️  Memes: ${memeCount}`);
    console.log(`  🎨 Templates: ${templateCount}`);
    console.log(`  👤 Users: ${userCount}`);
};

const main = async () => {
    await connectDB();
    
    console.log('🧹 Starting comprehensive image cleanup...');
    
    await cleanUpMemes();
    await cleanUpTemplates();
    await cleanUpUserAvatars();
    await getCollectionCounts();
    
    await mongoose.disconnect();
    console.log('\n✅ Comprehensive cleanup complete - disconnected from database');
};

// Run the script
main().catch(console.error);
