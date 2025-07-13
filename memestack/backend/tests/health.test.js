// Simple Health Check Test
// Basic test to verify test setup is working

const request = require('supertest');
const app = require('./testApp');

describe('Health Check', () => {
    it('should return health status', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('MemeStack API is running');
        expect(response.body.environment).toBe('test');
    });
    
    it('should return 404 for unknown routes', async () => {
        const response = await request(app)
            .get('/api/unknown')
            .expect(404);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Route not found');
    });
});
