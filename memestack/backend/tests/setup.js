// Test Setup for MemeStack Backend
// Global test configuration and utilities

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

let mongoServer;

// Global test setup
beforeAll(async () => {
    // Disconnect existing connection if any
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    console.log('✅ Test database connected');
});

// Global test teardown
afterAll(async () => {
    try {
        // Close database connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
        
        // Stop the in-memory MongoDB server
        if (mongoServer) {
            await mongoServer.stop();
        }
        
        console.log('✅ Test database disconnected');
    } catch (error) {
        console.log('⚠️ Error during test cleanup:', error.message);
    }
});

// Clear all collections between tests
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});

// Global test utilities
global.testUtils = {
    // Create test user data
    createTestUser: () => ({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!'
    }),
    
    // Create test meme data
    createTestMeme: () => ({
        title: 'Test Meme',
        description: 'A test meme for testing',
        tags: ['test', 'meme'],
        category: 'General'
    }),
    
    // Generate random string
    randomString: (length = 10) => {
        return Math.random().toString(36).substring(2, length + 2);
    }
};
