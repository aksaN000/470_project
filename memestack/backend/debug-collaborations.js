// Debug script to check collaboration visibility
const mongoose = require('mongoose');
require('./config/database');

const Collaboration = require('./models/Collaboration');

async function checkCollaborations() {
    try {
        console.log('🔍 Checking all collaborations in database...');
        
        const allCollabs = await Collaboration.find({}).select('title type status settings owner');
        console.log('\n📊 All collaborations:');
        allCollabs.forEach((collab, index) => {
            console.log(`${index + 1}. ${collab.title}`);
            console.log(`   - Type: ${collab.type}`);
            console.log(`   - Status: ${collab.status}`);
            console.log(`   - Owner: ${collab.owner}`);
            console.log(`   - Settings:`, collab.settings);
            console.log(`   - IsPublic: ${collab.settings?.isPublic}`);
            console.log('---');
        });
        
        console.log('\n🔍 Checking public collaborations filter...');
        const publicCollabs = await Collaboration.find({ 'settings.isPublic': true }).select('title type status settings');
        console.log(`📊 Public collaborations count: ${publicCollabs.length}`);
        publicCollabs.forEach((collab, index) => {
            console.log(`${index + 1}. ${collab.title} (${collab.type}) - Status: ${collab.status}`);
        });
        
        console.log('\n🔍 Checking active + public collaborations...');
        const activePublicCollabs = await Collaboration.find({ 
            'settings.isPublic': true,
            status: 'active'
        }).select('title type status settings');
        console.log(`📊 Active + Public collaborations count: ${activePublicCollabs.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking collaborations:', error);
        process.exit(1);
    }
}

checkCollaborations();
