// 🧪 Database Connection Tester
// This helps you test different database options

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Test MongoDB Atlas connection
const testAtlasConnection = async (connectionString) => {
    try {
        console.log('🔄 Testing Atlas connection...');
        
        await mongoose.connect(connectionString);
        
        console.log('✅ Atlas connection successful!');
        console.log(`📊 Connected to: ${mongoose.connection.name}`);
        console.log(`🌍 Host: ${mongoose.connection.host}`);
        
        await mongoose.disconnect();
        return true;
        
    } catch (error) {
        console.error('❌ Atlas connection failed:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('💡 Check your username and password in the connection string');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Check your network access settings in Atlas');
        }
        
        return false;
    }
};

// Set up in-memory MongoDB for testing
const setupMemoryDB = async () => {
    try {
        console.log('🔄 Starting in-memory MongoDB...');
        
        const mongod = new MongoMemoryServer({
            instance: {
                dbName: 'memestack'
            }
        });
        
        await mongod.start();
        const uri = mongod.getUri();
        
        console.log('✅ In-memory MongoDB started!');
        console.log(`🔗 Connection URI: ${uri}`);
        
        await mongoose.connect(uri);
        
        console.log('✅ Connected to in-memory database!');
        console.log('📝 This database is temporary and will reset when server restarts');
        
        return { mongod, uri };
        
    } catch (error) {
        console.error('❌ Failed to start in-memory MongoDB:', error.message);
        return null;
    }
};

// Main testing function
const testDatabase = async () => {
    console.log('\n🗄️ Database Connection Tester\n');
    
    // Check if MONGODB_URI is set for Atlas
    const atlasUri = process.env.MONGODB_URI;
    
    if (atlasUri && atlasUri.includes('mongodb+srv://')) {
        console.log('🌐 Atlas connection string detected');
        const atlasWorks = await testAtlasConnection(atlasUri);
        
        if (atlasWorks) {
            console.log('\n🎉 Atlas is ready to use!');
            console.log('💡 Your server will now use Atlas database');
            return { type: 'atlas', uri: atlasUri };
        }
    }
    
    console.log('\n🔄 Setting up temporary in-memory database...');
    const memorySetup = await setupMemoryDB();
    
    if (memorySetup) {
        console.log('\n🎉 In-memory database is ready!');
        console.log('💡 Perfect for testing - data will reset on restart');
        return { type: 'memory', ...memorySetup };
    }
    
    console.log('\n❌ Could not set up any database');
    return null;
};

module.exports = {
    testAtlasConnection,
    setupMemoryDB,
    testDatabase
};
