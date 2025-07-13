// Quick Backend Test Script
// Run this to check if the backend can start properly

const express = require('express');

async function testBackendStartup() {
    console.log('🧪 Testing MemeStack Backend Startup...\n');
    
    try {
        // Test 1: Check if all required modules can be loaded
        console.log('1️⃣ Testing module imports...');
        
        const mongoose = require('mongoose');
        console.log('✅ mongoose loaded');
        
        const cors = require('cors');
        console.log('✅ cors loaded');
        
        const dotenv = require('dotenv');
        console.log('✅ dotenv loaded');
        
        const bcrypt = require('bcryptjs');
        console.log('✅ bcryptjs loaded');
        
        const jwt = require('jsonwebtoken');
        console.log('✅ jsonwebtoken loaded');
        
        // Test 2: Check if MongoDB Memory Server can be loaded
        console.log('\n2️⃣ Testing MongoDB Memory Server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('✅ mongodb-memory-server loaded');
        
        // Test 3: Check if multer can be loaded
        console.log('\n3️⃣ Testing file upload dependencies...');
        const multer = require('multer');
        console.log('✅ multer loaded');
        
        // Test 4: Test basic Express setup
        console.log('\n4️⃣ Testing Express setup...');
        const app = express();
        app.use(express.json());
        console.log('✅ Express configured');
        
        // Test 5: Try starting MongoDB Memory Server
        console.log('\n5️⃣ Testing in-memory database...');
        const mongod = new MongoMemoryServer({
            instance: { dbName: 'test' }
        });
        
        await mongod.start();
        const uri = mongod.getUri();
        console.log('✅ In-memory MongoDB started');
        
        await mongoose.connect(uri);
        console.log('✅ Database connection successful');
        
        // Cleanup
        await mongoose.disconnect();
        await mongod.stop();
        console.log('✅ Cleanup completed');
        
        console.log('\n🎉 All tests passed! Backend should start successfully.');
        console.log('\n🚀 To start the backend:');
        console.log('   cd memestack/backend');
        console.log('   npm run dev');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\n🔧 Possible solutions:');
        console.error('   1. Run: npm install');
        console.error('   2. Check Node.js version (should be 14+)');
        console.error('   3. Delete node_modules and run npm install again');
        console.error('   4. Check if all dependencies are properly installed');
        
        process.exit(1);
    }
}

testBackendStartup();
