# 🚀 MishMob Deployment Guide

## Step-by-Step Production Deployment

### Phase 1: GitHub Integration (5 mins)

1. **Connect Lovable to GitHub**
   ```
   Lovable → GitHub → Connect to GitHub
   → Authorize Lovable GitHub App
   → Select your GitHub account/organization
   → Create Repository: "mishmob-frontend"
   ```

2. **Verify GitHub Actions**
   - Push triggers the workflow in `.github/workflows/deploy.yml`
   - Frontend builds automatically
   - Backend deployment ready (when backend repo exists)

### Phase 2: AWS Infrastructure Setup (20 mins)

#### 2.1 Aurora Serverless v2 Database
```bash
# Option 1: AWS Console (Recommended for beginners)
# 1. Go to RDS → Create Database
# 2. Choose Aurora PostgreSQL
# 3. Select Serverless v2 capacity type
# 4. Set min capacity: 0.5 ACU, max: 4 ACU
# 5. Note the endpoint: your-cluster.cluster-xxxxxx.region.rds.amazonaws.com

# Option 2: AWS CLI (Advanced users)
aws rds create-db-cluster \
  --db-cluster-identifier mishmob-aurora \
  --engine aurora-postgresql \
  --engine-mode provisioned \
  --serverlessv2-scaling-configuration MinCapacity=0.5,MaxCapacity=4.0 \
  --master-username postgres \
  --master-user-password YourSecurePassword123
```

#### 2.2 ECR Repository
```bash
aws ecr create-repository --repository-name mishmob-backend --region us-east-1
# Note the URI: 123456789012.dkr.ecr.us-east-1.amazonaws.com/mishmob-backend
```

#### 2.3 S3 Bucket
```bash
aws s3 mb s3://mishmob-assets-prod --region us-east-1
aws s3api put-bucket-cors --bucket mishmob-assets-prod --cors-configuration file://cors-policy.json
```

### Phase 3: EC2 Server Setup (15 mins)

#### 3.1 Launch EC2 Instance
```bash
# Launch Ubuntu 22.04 LTS
# Instance type: t3.medium (minimum for production)
# Security Group: Allow ports 22, 80, 443
# Storage: 30GB GP3 minimum
```

#### 3.2 Install Dependencies
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run the setup script
curl -o setup.sh https://raw.githubusercontent.com/yourusername/mishmob-frontend/main/deployment/setup-ec2.sh
chmod +x setup.sh && ./setup.sh
```

### Phase 4: Configure Environment (10 mins)

#### 4.1 Update Environment Variables
```bash
cd /opt/mishmob
nano .env

# Fill in your actual values:
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123
DB_NAME=mishmob
AURORA_ENDPOINT=your-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com

DJANGO_SECRET_KEY=your-super-secret-django-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-ec2-ip

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
S3_BUCKET_NAME=mishmob-assets-prod
```

#### 4.2 Configure GitHub Secrets
```bash
# In your GitHub repository: Settings → Secrets and variables → Actions
# Add these secrets:

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
EC2_HOST=your-ec2-ip-or-domain
EC2_USERNAME=ubuntu
EC2_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----...
```

### Phase 5: Backend Repository Setup (15 mins)

#### 5.1 Create Backend Repository
```bash
# Create new GitHub repository: "mishmob-backend"
mkdir ~/mishmob-backend && cd ~/mishmob-backend
git clone https://github.com/yourusername/mishmob-backend.git .

# Copy the scaffold structure
cp -r path/to/frontend/backend-scaffold/* .

# Follow backend-scaffold/README.md for Django setup
```

### Phase 6: SSL Certificate (5 mins)

#### Option 1: Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Option 2: AWS Certificate Manager + ALB
```bash
# Create certificate in ACM
# Set up Application Load Balancer
# Point ALB to EC2 instance
```

### Phase 7: Deploy! (2 mins)

```bash
cd /opt/mishmob
./deploy.sh
```

## 🔍 Verification Checklist

### Frontend
- [ ] https://your-domain.com loads correctly
- [ ] All pages render properly
- [ ] Responsive design works on mobile
- [ ] GitHub Actions runs successfully on push

### Backend (when deployed)
- [ ] https://your-domain.com/api/health returns 200 OK
- [ ] Database migrations complete successfully
- [ ] Static files serve correctly
- [ ] Media uploads work via S3

### Infrastructure
- [ ] Aurora database shows "Available" status
- [ ] ECR repository receives Docker images
- [ ] SSL certificate shows valid/trusted
- [ ] DNS resolves to correct IP

## 🚨 Troubleshooting

### Common Issues

#### GitHub Actions Fails
```bash
# Check secrets are correctly set
# Verify AWS credentials have correct permissions
# Ensure EC2 security group allows SSH (port 22)
```

#### Database Connection Error
```bash
# Check Aurora security group allows connection from EC2
# Verify endpoint URL is correct
# Test connection: telnet aurora-endpoint 5432
```

#### SSL Certificate Issues
```bash
# For Let's Encrypt: sudo certbot renew --dry-run
# For ACM: verify domain ownership in Route53
```

## 🔄 Daily Operations

### Deploy Updates
```bash
cd /opt/mishmob && ./deploy.sh
```

### Check Application Status
```bash
docker-compose -f deployment/docker-compose.prod.yml ps
docker-compose -f deployment/docker-compose.prod.yml logs -f
```

### Database Backup
```bash
# Aurora automatically backs up - check RDS console for restore options
```

### Monitor Resource Usage
```bash
# Check Aurora scaling in RDS console
# Monitor EC2 CPU/Memory in CloudWatch
top -p $(pgrep -f "docker-compose|nginx|postgres")
```

## 📊 Performance Optimization

### Frontend
- Static assets cached for 1 year
- Gzip compression enabled
- CDN recommended for global users

### Backend  
- Redis caching for database queries
- API response compression
- Database query optimization

### Infrastructure
- Aurora scales automatically (0.5-4 ACUs)
- EC2 auto-scaling group (future enhancement)
- CloudWatch monitoring and alerts

## 💰 Cost Estimation (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Aurora Serverless v2 | 0.5-2 ACU average | $15-60 |
| EC2 t3.medium | 24/7 | $30 |
| EBS Storage | 30GB | $3 |
| S3 Storage | 10GB + requests | $5 |
| Data Transfer | Moderate | $10 |
| **Total** | | **$63-108** |

*Note: Costs vary by region and actual usage*

---

**🎉 Congratulations! MishMob is now live and ready to mobilize your community!**