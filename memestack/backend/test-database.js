// 🧪 Quick Database Test Script
// Run this to test your database connection

require('dotenv').config();
const { testDatabase } = require('./utils/databaseTester');

const runTest = async () => {
    try {
        console.log('🚀 MemeStack Database Test\n');
        
        const result = await testDatabase();
        
        if (result) {
            console.log('\n✅ Database setup successful!');
            console.log(`📊 Using: ${result.type === 'atlas' ? 'MongoDB Atlas' : 'In-Memory Database'}`);
            
            if (result.type === 'memory') {
                console.log('\n📝 To use Atlas instead:');
                console.log('1. Complete the Atlas setup guide (ATLAS_SETUP.md)');
                console.log('2. Update your .env file with the Atlas connection string');
                console.log('3. Restart your server');
            }
            
            console.log('\n🎯 Next steps:');
            console.log('1. Keep your server running (npm run dev)');
            console.log('2. Test the authentication endpoints');
            console.log('3. Create your first user account!');
            
        } else {
            console.log('\n❌ Database setup failed');
            console.log('💡 Check the ATLAS_SETUP.md guide for help');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
};

// Run the test
runTest();
