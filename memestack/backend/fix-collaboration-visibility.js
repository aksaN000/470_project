const mongoose = require('mongoose');
const Collaboration = require('./models/Collaboration');

// Connect to database
mongoose.connect('mongodb://localhost:27017/memestack', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function fixCollaborationVisibility() {
    try {
        console.log('🔧 Checking collaboration visibility settings...');
        
        // Find all collaborations
        const allCollaborations = await Collaboration.find({});
        console.log(`Found ${allCollaborations.length} total collaborations`);
        
        // Check which ones are not public
        const privateCollaborations = await Collaboration.find({ 'settings.isPublic': { $ne: true } });
        console.log(`Found ${privateCollaborations.length} non-public collaborations`);
        
        if (privateCollaborations.length > 0) {
            console.log('📝 Private collaborations:');
            privateCollaborations.forEach(collab => {
                console.log(`  - ${collab.title} (${collab.status}) - isPublic: ${collab.settings?.isPublic}`);
            });
            
            // Update all collaborations to be public by default
            const result = await Collaboration.updateMany(
                { 'settings.isPublic': { $ne: true } },
                { $set: { 'settings.isPublic': true } }
            );
            
            console.log(`✅ Updated ${result.modifiedCount} collaborations to be public`);
        } else {
            console.log('✅ All collaborations are already public');
        }
        
        // Show current state
        const updatedCollaborations = await Collaboration.find({}).populate('owner', 'username');
        console.log('\n📊 Current collaboration status:');
        updatedCollaborations.forEach(collab => {
            console.log(`  - "${collab.title}" by ${collab.owner?.username} - Status: ${collab.status}, Public: ${collab.settings?.isPublic}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

fixCollaborationVisibility();
