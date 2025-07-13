# 🚀 MemeStack Production Deployment Guide

## Overview
This guide covers deploying MemeStack to a production environment with proper security, scalability, and monitoring.

## Prerequisites

### 1. MongoDB Atlas Setup
- Create a MongoDB Atlas account at https://cloud.mongodb.com
- Create a new cluster
- Create a database user with read/write permissions
- Add your server's IP to the whitelist
- Copy the connection string

### 2. Environment Variables
Copy `.env.production` to `.env` and update:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/memestack
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_characters
CLIENT_URL=https://your-frontend-domain.com
PORT=5000
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

2. **Build and run**:
```bash
docker build -t memestack-backend .
docker run -p 5000:5000 --env-file .env memestack-backend
```

### Option 2: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-memestack-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_atlas_connection_string"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set CLIENT_URL="https://your-frontend-domain.com"

# Deploy
git add .
git commit -m "Production deployment"
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### DigitalOcean App Platform
- Connect your GitHub repository
- Set environment variables in the control panel
- Configure build and run commands

### Option 3: VPS Deployment

1. **Server Setup**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Application Setup**:
```bash
# Clone repository
git clone https://github.com/yourusername/memestack.git
cd memestack/backend

# Install dependencies
npm ci --only=production

# Create .env file with production values
cp .env.production .env
# Edit .env with your production values

# Start with PM2
pm2 start npm --name "memestack-api" -- start
pm2 startup
pm2 save
```

3. **Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Checklist

### ✅ Pre-deployment Security
- [ ] Strong JWT secret (minimum 32 characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables secured
- [ ] HTTPS/SSL certificates configured
- [ ] CORS origins restricted to your domain
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] File upload restrictions configured

### ✅ Post-deployment Monitoring
- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] Log monitoring configured
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented
- [ ] Alert system configured

## Performance Optimization

### 1. Database Optimization
- Index frequently queried fields
- Use connection pooling
- Implement database connection retry logic
- Monitor query performance

### 2. Caching Strategy
- Implement Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets
- Implement API response caching

### 3. Load Balancing
- Use multiple server instances
- Implement horizontal scaling
- Configure auto-scaling policies
- Monitor resource usage

## Monitoring & Logging

### Application Monitoring
```javascript
// Add to your app for production monitoring
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Checks
- Database connectivity: `/api/health`
- API response time monitoring
- Error rate tracking
- Memory usage monitoring

## Backup Strategy

### Database Backups
- Daily automated backups via MongoDB Atlas
- Cross-region backup replication
- Backup restoration testing
- Point-in-time recovery setup

### Application Backups
- Code repository backups
- Environment configuration backups
- User-uploaded file backups
- Regular backup verification

## Scaling Considerations

### Vertical Scaling
- Increase server CPU/RAM
- Optimize database queries
- Implement caching layers
- Monitor resource usage

### Horizontal Scaling
- Load balancer configuration
- Session storage externalization
- Database read replicas
- Microservices architecture

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist
   - Validate database credentials

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Validate token format

3. **CORS Errors**
   - Verify CLIENT_URL is correct
   - Check CORS configuration
   - Validate request headers

### Debug Commands
```bash
# Check application logs
pm2 logs memestack-api

# Monitor real-time performance
pm2 monit

# Restart application
pm2 restart memestack-api

# Check health endpoint
curl https://your-api-domain.com/api/health
```

## Maintenance

### Regular Tasks
- [ ] Security updates (monthly)
- [ ] Dependency updates (monthly)
- [ ] Performance optimization (quarterly)
- [ ] Backup verification (weekly)
- [ ] Security audit (quarterly)
- [ ] Database optimization (monthly)

### Emergency Procedures
- Incident response plan
- Rollback procedures
- Emergency contact list
- Communication protocols

## Support

For production support:
- Check logs first: `pm2 logs`
- Verify health endpoint: `/api/health`
- Monitor database status
- Check environment variables
- Review recent deployments

---

**🚨 Important**: Never commit production environment variables to version control. Always use secure environment variable management.
