// Authentication API Tests
// Comprehensive testing for auth endpoints

const request = require('supertest');
const app = require('./testApp');
const User = require('../models/User');

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = global.testUtils.createTestUser();
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('_id');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.username).toBe(userData.username);
            expect(response.body.data).toHaveProperty('token');
            
            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.username).toBe(userData.username);
        });
        
        it('should not register user with invalid email', async () => {
            const userData = {
                ...global.testUtils.createTestUser(),
                email: 'invalid-email'
            };
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('email');
        });
        
        it('should not register user with weak password', async () => {
            const userData = {
                ...global.testUtils.createTestUser(),
                password: '123'
            };
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('password');
        });
        
        it('should not register user with existing email', async () => {
            const userData = global.testUtils.createTestUser();
            
            // Register user first time
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            
            // Try to register same user again
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
        
        it('should not register user with missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com'
                    // missing username and password
                })
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });
    });
    
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            const userData = global.testUtils.createTestUser();
            await request(app)
                .post('/api/auth/register')
                .send(userData);
        });
        
        it('should login user with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'TestPassword123!'
            };
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('_id');
            expect(response.body.data.user.email).toBe(loginData.email);
            expect(response.body.data).toHaveProperty('token');
        });
        
        it('should not login with invalid email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'TestPassword123!'
            };
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });
        
        it('should not login with invalid password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });
        
        it('should not login with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                    // missing password
                })
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });
    });
    
    describe('GET /api/auth/profile', () => {
        let authToken;
        let userId;
        
        beforeEach(async () => {
            // Register and login to get auth token
            const userData = global.testUtils.createTestUser();
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            authToken = registerResponse.body.data.token;
            userId = registerResponse.body.data.user._id;
        });
        
        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.user._id).toBe(userId);
            expect(response.body.data.user.email).toBe('test@example.com');
        });
        
        it('should not get profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('No token provided');
        });
        
        it('should not get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid token');
        });
    });
    
    describe('PUT /api/auth/profile', () => {
        let authToken;
        let userId;
        
        beforeEach(async () => {
            const userData = global.testUtils.createTestUser();
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            authToken = registerResponse.body.data.token;
            userId = registerResponse.body.data.user._id;
        });
        
        it('should update user profile successfully', async () => {
            const updateData = {
                username: 'updateduser',
                bio: 'Updated bio for testing'
            };
            
            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.username).toBe(updateData.username);
            expect(response.body.data.user.bio).toBe(updateData.bio);
        });
        
        it('should not update profile without authentication', async () => {
            const updateData = {
                username: 'updateduser'
            };
            
            const response = await request(app)
                .put('/api/auth/profile')
                .send(updateData)
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
    });
});
