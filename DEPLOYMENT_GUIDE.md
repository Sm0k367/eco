# 🚀 Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Heroku Deployment (Backend)](#heroku-deployment-backend)
4. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
5. [AWS Deployment](#aws-deployment)
6. [Production Checklist](#production-checklist)

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gift-card-exchange.git
cd gift-card-exchange
```

2. **Backend Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/health

---

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Setup

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t giftcard-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://localhost:27017/gift-card-exchange \
  -e JWT_SECRET=your_secret \
  giftcard-backend
```

**Frontend:**
```bash
cd frontend
docker build -t giftcard-frontend .
docker run -p 3000:3000 giftcard-frontend
```

---

## Heroku Deployment (Backend)

### Prerequisites
- Heroku CLI installed
- Heroku account

### Setup

1. **Create Heroku app**
```bash
heroku create your-app-name
```

2. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

3. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
cd backend
git push heroku main
```

5. **View logs**
```bash
heroku logs --tail
```

6. **Access API**
```
https://your-app-name.herokuapp.com/api
```

### Scaling

```bash
# Scale dynos
heroku ps:scale web=2

# View dyno status
heroku ps
```

---

## Vercel Deployment (Frontend)

### Prerequisites
- Vercel account
- GitHub repository

### Setup

1. **Connect GitHub repository**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click "Import"

2. **Configure environment variables**
   - Add `REACT_APP_API_URL`: Your backend API URL
   - Add `REACT_APP_FRONTEND_URL`: Your frontend URL

3. **Deploy**
   - Vercel automatically deploys on push to main
   - View deployment at: https://your-project.vercel.app

4. **Custom domain**
   - Go to Project Settings > Domains
   - Add your custom domain

### Manual Deployment

```bash
npm install -g vercel
cd frontend
vercel --prod
```

---

## AWS Deployment

### Backend (EC2 + RDS)

1. **Create EC2 instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.micro (free tier)
   - Security group: Allow ports 22, 80, 443, 5000

2. **Connect and setup**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (or use RDS)
sudo apt install -y mongodb

# Clone repository
git clone https://github.com/yourusername/gift-card-exchange.git
cd gift-card-exchange/backend

# Install dependencies
npm install

# Create .env file
nano .env

# Start application
npm start
```

3. **Setup PM2 for process management**
```bash
sudo npm install -g pm2
pm2 start server.js --name "giftcard-api"
pm2 startup
pm2 save
```

4. **Setup Nginx reverse proxy**
```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

5. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Frontend (S3 + CloudFront)

1. **Create S3 bucket**
   - Bucket name: your-app-frontend
   - Block public access: OFF
   - Enable versioning

2. **Build and upload**
```bash
cd frontend
npm run build
aws s3 sync build/ s3://your-app-frontend --delete
```

3. **Create CloudFront distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Viewer protocol policy: Redirect HTTP to HTTPS

4. **Setup custom domain**
   - Add CNAME record pointing to CloudFront distribution

---

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable CORS properly
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Enable database encryption
- [ ] Setup backup strategy
- [ ] Enable audit logging
- [ ] Regular security updates

### Performance
- [ ] Enable caching headers
- [ ] Setup CDN
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Minify assets
- [ ] Setup monitoring
- [ ] Configure auto-scaling
- [ ] Load testing

### Monitoring & Logging
- [ ] Setup error tracking (Sentry)
- [ ] Setup performance monitoring (DataDog)
- [ ] Setup log aggregation (ELK Stack)
- [ ] Setup uptime monitoring
- [ ] Setup alerts
- [ ] Regular log review

### Backup & Recovery
- [ ] Daily database backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Setup disaster recovery plan
- [ ] Regular drills

### Compliance
- [ ] GDPR compliance
- [ ] Data privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] PCI DSS (if handling payments)
- [ ] Regular audits

---

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl https://your-api.com/health

# Frontend health
curl https://your-app.com
```

### Database Maintenance
```bash
# Backup MongoDB
mongodump --uri "mongodb://..." --out ./backup

# Restore MongoDB
mongorestore --uri "mongodb://..." ./backup
```

### Log Monitoring
```bash
# Heroku logs
heroku logs --tail

# AWS CloudWatch
aws logs tail /aws/ec2/your-instance --follow

# Docker logs
docker-compose logs -f
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
npm run dev

# Check port
lsof -i :5000

# Check MongoDB connection
mongosh "mongodb://..."
```

### Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection issues
```bash
# Test connection
mongosh "mongodb://..."

# Check credentials
echo $MONGODB_URI
```

---

## Cost Optimization

### Heroku
- Use eco dynos for low-traffic apps
- Scale down during off-peak hours
- Use free tier for development

### AWS
- Use t3.micro for low traffic
- Use RDS free tier
- Use CloudFront for caching
- Set up auto-scaling

### Vercel
- Free tier includes unlimited deployments
- Pay only for bandwidth overages

---

## Scaling Strategy

### Phase 1: MVP (0-1000 users)
- Single server (Heroku eco)
- Shared database
- Basic monitoring

### Phase 2: Growth (1000-10000 users)
- Multiple dynos
- Database replication
- CDN for static assets
- Advanced monitoring

### Phase 3: Scale (10000+ users)
- Kubernetes cluster
- Database sharding
- Multi-region deployment
- Advanced caching
- Load balancing

---

## Support

For deployment issues, contact: devops@giftcardexchange.com

---

**Last Updated**: January 2024
