// 🧹 Script to Clean Up Broken Image URLs
// Run this script to remove memes with broken image URLs

const mongoose = require('mongoose');
require('dotenv').config({ path: './memestack/backend/.env' });

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@alif.wchm6bo.mongodb.net/memestack?retryWrites=true&w=majority';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('💡 Make sure your .env file is in memestack/backend/ directory');
        process.exit(1);
    }
};

// Load the Meme model
const memeSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    thumbnailUrl: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'memes' });

const Meme = mongoose.model('Meme', memeSchema);

const cleanUpBrokenImages = async () => {
    try {
        console.log('🔍 Searching for memes with broken image URLs...');
        
        // Find memes with localhost or vercel URLs (these are broken)
        const brokenMemes = await Meme.find({
            $or: [
                { imageUrl: { $regex: 'localhost:5000' } },
                { imageUrl: { $regex: '470-project.vercel.app/uploads' } },
                { imageUrl: { $regex: '^/uploads' } } // Relative URLs
            ]
        });
        
        console.log(`📊 Found ${brokenMemes.length} memes with broken image URLs`);
        
        if (brokenMemes.length === 0) {
            console.log('✅ No broken images found!');
            return;
        }
        
        // Log the broken memes for review
        console.log('\n📋 Broken memes:');
        brokenMemes.forEach((meme, index) => {
            console.log(`${index + 1}. "${meme.title}" - ${meme.imageUrl}`);
        });
        
        // Ask for confirmation (in a real script, you'd use readline)
        console.log('\n❓ To delete these broken memes, run:');
        console.log('   await Meme.deleteMany({ _id: { $in: brokenMemeIds } });');
        
        // Uncomment the following lines to actually delete them:
        console.log('\n⚠️  To DELETE these broken memes, uncomment the lines below and run again:');
        console.log('// Uncomment these lines in the script:');
        console.log('// const brokenMemeIds = brokenMemes.map(meme => meme._id);');
        console.log('// const deleteResult = await Meme.deleteMany({ _id: { $in: brokenMemeIds } });');
        console.log('// console.log(`🗑️  Deleted ${deleteResult.deletedCount} broken memes`);');
        
        const brokenMemeIds = brokenMemes.map(meme => meme._id);
        const deleteResult = await Meme.deleteMany({ _id: { $in: brokenMemeIds } });
        console.log(`\n🗑️  DELETED ${deleteResult.deletedCount} broken memes from MongoDB Atlas`);
        console.log('✅ Database cleanup complete!');
        
    } catch (error) {
        console.error('❌ Error cleaning up broken images:', error);
    }
};

const main = async () => {
    await connectDB();
    await cleanUpBrokenImages();
    await mongoose.disconnect();
    console.log('✅ Cleanup complete');
};

// Run the script
main().catch(console.error);
