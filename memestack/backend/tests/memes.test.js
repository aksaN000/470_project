// Meme Management API Tests
// Comprehensive testing for meme CRUD operations

const request = require('supertest');
const app = require('./testApp');
const User = require('../models/User');
const Meme = require('../models/Meme');
const path = require('path');
const fs = require('fs');

describe('Meme Management API', () => {
    let authToken;
    let userId;
    let testMemeId;
    
    // Helper function to create authenticated user
    const createAuthenticatedUser = async () => {
        const userData = global.testUtils.createTestUser();
        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);
        
        return {
            token: response.body.data.token,
            userId: response.body.data.user._id
        };
    };
    
    beforeEach(async () => {
        const auth = await createAuthenticatedUser();
        authToken = auth.token;
        userId = auth.userId;
    });
    
    describe('POST /api/memes', () => {
        it('should create a new meme successfully', async () => {
            const memeData = global.testUtils.createTestMeme();
            
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.meme).toHaveProperty('_id');
            expect(response.body.data.meme.title).toBe(memeData.title);
            expect(response.body.data.meme.creator).toBe(userId);
            
            testMemeId = response.body.data.meme._id;
        });
        
        it('should not create meme without authentication', async () => {
            const memeData = global.testUtils.createTestMeme();
            
            const response = await request(app)
                .post('/api/memes')
                .send(memeData)
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
        
        it('should not create meme without required fields', async () => {
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    description: 'Missing title'
                })
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });
        
        it('should create meme with valid tags', async () => {
            const memeData = {
                ...global.testUtils.createTestMeme(),
                tags: ['funny', 'testing', 'jest']
            };
            
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData)
                .expect(201);
            
            expect(response.body.data.meme.tags).toEqual(memeData.tags);
        });
    });
    
    describe('GET /api/memes', () => {
        beforeEach(async () => {
            // Create some test memes
            for (let i = 0; i < 3; i++) {
                const memeData = {
                    ...global.testUtils.createTestMeme(),
                    title: `Test Meme ${i + 1}`
                };
                
                await request(app)
                    .post('/api/memes')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(memeData);
            }
        });
        
        it('should get all memes with pagination', async () => {
            const response = await request(app)
                .get('/api/memes')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.memes).toBeInstanceOf(Array);
            expect(response.body.data.memes.length).toBe(3);
            expect(response.body.data.pagination).toHaveProperty('currentPage');
            expect(response.body.data.pagination).toHaveProperty('totalPages');
            expect(response.body.data.pagination).toHaveProperty('totalMemes');
        });
        
        it('should filter memes by category', async () => {
            // Create a meme with specific category
            const memeData = {
                ...global.testUtils.createTestMeme(),
                category: 'Programming'
            };
            
            await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData);
            
            const response = await request(app)
                .get('/api/memes?category=Programming')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.memes.length).toBe(1);
            expect(response.body.data.memes[0].category).toBe('Programming');
        });
        
        it('should search memes by title', async () => {
            const response = await request(app)
                .get('/api/memes?search=Test Meme 1')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.memes.length).toBe(1);
            expect(response.body.data.memes[0].title).toContain('Test Meme 1');
        });
        
        it('should sort memes by creation date', async () => {
            const response = await request(app)
                .get('/api/memes?sortBy=createdAt&sortOrder=desc')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.memes).toBeInstanceOf(Array);
            
            // Verify sorting (newest first)
            const memes = response.body.data.memes;
            for (let i = 1; i < memes.length; i++) {
                const current = new Date(memes[i].createdAt);
                const previous = new Date(memes[i - 1].createdAt);
                expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
            }
        });
    });
    
    describe('GET /api/memes/:id', () => {
        beforeEach(async () => {
            // Create a test meme
            const memeData = global.testUtils.createTestMeme();
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData);
            
            testMemeId = response.body.data.meme._id;
        });
        
        it('should get meme by ID', async () => {
            const response = await request(app)
                .get(`/api/memes/${testMemeId}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.meme._id).toBe(testMemeId);
            expect(response.body.data.meme).toHaveProperty('title');
            expect(response.body.data.meme).toHaveProperty('creator');
        });
        
        it('should return 404 for non-existent meme', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            
            const response = await request(app)
                .get(`/api/memes/${fakeId}`)
                .expect(404);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });
        
        it('should return 400 for invalid meme ID format', async () => {
            const response = await request(app)
                .get('/api/memes/invalid-id')
                .expect(400);
            
            expect(response.body.success).toBe(false);
        });
    });
    
    describe('PUT /api/memes/:id', () => {
        beforeEach(async () => {
            const memeData = global.testUtils.createTestMeme();
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData);
            
            testMemeId = response.body.data.meme._id;
        });
        
        it('should update meme successfully', async () => {
            const updateData = {
                title: 'Updated Test Meme',
                description: 'Updated description',
                tags: ['updated', 'testing']
            };
            
            const response = await request(app)
                .put(`/api/memes/${testMemeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.meme.title).toBe(updateData.title);
            expect(response.body.data.meme.description).toBe(updateData.description);
            expect(response.body.data.meme.tags).toEqual(updateData.tags);
        });
        
        it('should not update meme without authentication', async () => {
            const updateData = { title: 'Updated Title' };
            
            const response = await request(app)
                .put(`/api/memes/${testMemeId}`)
                .send(updateData)
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
        
        it('should not update meme by non-owner', async () => {
            // Create another user
            const otherAuth = await createAuthenticatedUser();
            
            const updateData = { title: 'Unauthorized Update' };
            
            const response = await request(app)
                .put(`/api/memes/${testMemeId}`)
                .set('Authorization', `Bearer ${otherAuth.token}`)
                .send(updateData)
                .expect(403);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('authorized');
        });
    });
    
    describe('DELETE /api/memes/:id', () => {
        beforeEach(async () => {
            const memeData = global.testUtils.createTestMeme();
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData);
            
            testMemeId = response.body.data.meme._id;
        });
        
        it('should delete meme successfully', async () => {
            const response = await request(app)
                .delete(`/api/memes/${testMemeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
            
            // Verify meme is actually deleted
            const deletedMeme = await Meme.findById(testMemeId);
            expect(deletedMeme).toBeNull();
        });
        
        it('should not delete meme without authentication', async () => {
            const response = await request(app)
                .delete(`/api/memes/${testMemeId}`)
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
        
        it('should not delete meme by non-owner', async () => {
            const otherAuth = await createAuthenticatedUser();
            
            const response = await request(app)
                .delete(`/api/memes/${testMemeId}`)
                .set('Authorization', `Bearer ${otherAuth.token}`)
                .expect(403);
            
            expect(response.body.success).toBe(false);
        });
    });
    
    describe('POST /api/memes/:id/like', () => {
        beforeEach(async () => {
            const memeData = global.testUtils.createTestMeme();
            const response = await request(app)
                .post('/api/memes')
                .set('Authorization', `Bearer ${authToken}`)
                .send(memeData);
            
            testMemeId = response.body.data.meme._id;
        });
        
        it('should like a meme successfully', async () => {
            const response = await request(app)
                .post(`/api/memes/${testMemeId}/like`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.meme.likes).toContain(userId);
            expect(response.body.data.meme.likesCount).toBe(1);
        });
        
        it('should unlike a meme when liked again', async () => {
            // Like the meme first
            await request(app)
                .post(`/api/memes/${testMemeId}/like`)
                .set('Authorization', `Bearer ${authToken}`);
            
            // Like again to unlike
            const response = await request(app)
                .post(`/api/memes/${testMemeId}/like`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.meme.likes).not.toContain(userId);
            expect(response.body.data.meme.likesCount).toBe(0);
        });
        
        it('should not like meme without authentication', async () => {
            const response = await request(app)
                .post(`/api/memes/${testMemeId}/like`)
                .expect(401);
            
            expect(response.body.success).toBe(false);
        });
    });
});
