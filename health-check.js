#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

async function checkServerHealth() {
    console.log('🏥 MemeStack Health Check Tool');
    console.log('================================\n');

    // Check if backend is running
    console.log('1️⃣ Checking Backend Server...');
    try {
        const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
        console.log('✅ Backend: RUNNING');
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Port: 5000`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend: NOT RUNNING');
            console.log('   Solution: Start backend with "npm run dev" in backend folder');
            return false;
        } else {
            console.log(`⚠️  Backend: ERROR - ${error.message}`);
        }
    }

    // Check API routes
    console.log('\n2️⃣ Testing API Routes...');
    const routes = [
        { name: 'Templates', path: '/templates' },
        { name: 'Memes', path: '/memes' },
        { name: 'Auth', path: '/auth/register' },
        { name: 'Comments', path: '/comments/docs' }
    ];

    for (const route of routes) {
        try {
            const response = await axios.get(`${API_BASE}${route.path}`, { timeout: 2000 });
            console.log(`✅ ${route.name}: OK (${response.status})`);
        } catch (error) {
            if (error.response) {
                console.log(`⚠️  ${route.name}: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`❌ ${route.name}: ${error.message}`);
            }
        }
    }

    // Check frontend
    console.log('\n3️⃣ Checking Frontend Server...');
    try {
        const response = await axios.get(FRONTEND_URL, { timeout: 3000 });
        console.log('✅ Frontend: RUNNING');
        console.log(`   Port: 3000`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Frontend: NOT RUNNING');
            console.log('   Solution: Start frontend with "npm start" in frontend folder');
        } else {
            console.log(`⚠️  Frontend: ERROR - ${error.message}`);
        }
    }

    // Check configuration files
    console.log('\n4️⃣ Checking Configuration...');
    
    const frontendEnv = path.join(__dirname, 'memestack', 'frontend', '.env');
    const backendEnv = path.join(__dirname, 'memestack', 'backend', '.env');
    
    if (fs.existsSync(frontendEnv)) {
        console.log('✅ Frontend .env: EXISTS');
        const content = fs.readFileSync(frontendEnv, 'utf8');
        if (content.includes('REACT_APP_API_URL=http://localhost:5000/api')) {
            console.log('✅ API URL: CORRECT');
        } else {
            console.log('⚠️  API URL: Check REACT_APP_API_URL in frontend/.env');
        }
    } else {
        console.log('❌ Frontend .env: MISSING');
    }

    if (fs.existsSync(backendEnv)) {
        console.log('✅ Backend .env: EXISTS');
    } else {
        console.log('❌ Backend .env: MISSING');
    }

    console.log('\n🚀 Quick Start Commands:');
    console.log('Backend: cd memestack/backend && npm run dev');
    console.log('Frontend: cd memestack/frontend && npm start');
    console.log('Or use: start-servers.bat\n');

    return true;
}

// Run the health check
checkServerHealth().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});
