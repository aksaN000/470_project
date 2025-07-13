// 🗄️ Database Configuration
// This file contains database-related configurations and utilities

const mongoose = require('mongoose');

// Database connection options
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Connection timeout (30 seconds)
    serverSelectionTimeoutMS: 30000,
    // Socket timeout (45 seconds)
    socketTimeoutMS: 45000,
    // Buffer max entries
    bufferMaxEntries: 0,
    // Max pool size
    maxPoolSize: 10,
    // Min pool size
    minPoolSize: 5,
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Check if MONGODB_URI is provided
        if (!process.env.MONGODB_URI) {
            throw new Error(
                'MONGODB_URI not found in environment variables. ' +
                'Please check your .env file.'
            );
        }

        console.log('🔄 Connecting to MongoDB...');
        
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, dbOptions);
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        return conn;
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:');
        console.error(`   ${error.message}`);
        
        // Provide helpful error messages
        if (error.message.includes('authentication failed')) {
            console.error('💡 Tip: Check your username and password in MONGODB_URI');
        } else if (error.message.includes('connection timed out')) {
            console.error('💡 Tip: Check your network connection and database URL');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('💡 Tip: Check if your MongoDB cluster URL is correct');
        }
        
        // Exit the process with failure
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
const gracefulShutdown = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
    }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
    connectDB,
    gracefulShutdown,
    dbOptions
};
