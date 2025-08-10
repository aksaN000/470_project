// Debug script to test folder creation functionality
const express = require('express');
const Folder = require('./models/Folder');

async function testFolderCreation() {
    try {
        console.log('🧪 Testing folder creation...');
        
        // Mock user ID (using one from the test data)
        const mockUserId = '6898cb46e351b76d87baad5c';
        
        // Test folder data
        const testFolderData = {
            name: 'Debug Test Folder',
            description: 'Testing folder creation functionality',
            color: '#6366f1',
            icon: 'folder',
            isPrivate: true,
            owner: mockUserId
        };
        
        console.log('📝 Creating folder with data:', testFolderData);
        
        // Create folder directly
        const folder = new Folder(testFolderData);
        const savedFolder = await folder.save();
        
        console.log('✅ Folder created successfully:', savedFolder);
        
        // Test retrieval
        const retrievedFolder = await Folder.findById(savedFolder._id);
        console.log('📂 Retrieved folder:', retrievedFolder);
        
        // Clean up
        await Folder.findByIdAndDelete(savedFolder._id);
        console.log('🧹 Cleanup completed');
        
    } catch (error) {
        console.error('❌ Error testing folder creation:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Export for manual testing
module.exports = testFolderCreation;

// Run if called directly
if (require.main === module) {
    // Wait for database connection
    setTimeout(testFolderCreation, 2000);
}
