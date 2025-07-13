const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBackendConnectivity() {
    console.log('🔍 Testing MemeStack Backend Connectivity...\n');
    
    const tests = [
        { name: 'Health Check', url: `${API_BASE}/health`, method: 'GET' },
        { name: 'Templates Route', url: `${API_BASE}/templates`, method: 'GET' },
        { name: 'Memes Route', url: `${API_BASE}/memes`, method: 'GET' },
        { name: 'Comments Route', url: `${API_BASE}/comments/docs`, method: 'GET' },
    ];

    for (const test of tests) {
        try {
            console.log(`📡 Testing ${test.name}...`);
            const response = await axios.get(test.url, { timeout: 5000 });
            console.log(`✅ ${test.name}: OK (${response.status})`);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${test.name}: Server not running (Connection refused)`);
            } else if (error.response) {
                console.log(`⚠️  ${test.name}: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }
    
    console.log('\n📝 Summary:');
    console.log('- If you see "Connection refused": Start the backend server');
    console.log('- If you see 404 errors: Routes are misconfigured');
    console.log('- If you see 401/403: Authentication issues');
    console.log('\n🚀 To start servers: Run start-servers.bat');
}

testBackendConnectivity().catch(console.error);
