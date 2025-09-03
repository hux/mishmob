#!/bin/bash

# MishMob EC2 Setup Script
# Run this on your EC2 instance to prepare for deployment

set -e

echo "🚀 Setting up MishMob production environment on EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Create application directory
sudo mkdir -p /opt/mishmob
sudo chown $USER:$USER /opt/mishmob
cd /opt/mishmob

# Clone repository (you'll need to set this up)
# git clone https://github.com/yourusername/mishmob.git .

# Create environment file template
cat > .env << EOL
# Database Configuration (Aurora Serverless v2)
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=mishmob
AURORA_ENDPOINT=your-aurora-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com

# Django Configuration
DJANGO_SECRET_KEY=your-super-secret-django-key
ALLOWED_HOSTS=mishmob.com,www.mishmob.com,your-ec2-ip
FRONTEND_URL=https://mishmob.com

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=mishmob-assets

# ECR Configuration
ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com

# Redis (optional)
REDIS_URL=redis://redis:6379/0
EOL

# Create SSL directory
sudo mkdir -p /opt/mishmob/ssl
echo "📋 Remember to place your SSL certificates in /opt/mishmob/ssl/"

# Configure AWS credentials for ECR
echo "📋 Configure AWS CLI for ECR access:"
echo "aws configure"

# Set up log rotation
sudo tee /etc/logrotate.d/mishmob << EOL
/opt/mishmob/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 $USER $USER
    postrotate
        /usr/local/bin/docker-compose -f /opt/mishmob/deployment/docker-compose.prod.yml restart frontend backend
    endscript
}
EOL

# Create systemd service for auto-start
sudo tee /etc/systemd/system/mishmob.service << EOL
[Unit]
Description=MishMob Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/mishmob
ExecStart=/usr/local/bin/docker-compose -f deployment/docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f deployment/docker-compose.prod.yml down
TimeoutStartSec=0
User=$USER

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl enable mishmob.service

# Set up firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create deployment script
cat > deploy.sh << 'EOL'
#!/bin/bash
set -e

echo "🚀 Deploying MishMob..."

# Load environment variables
source .env

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Pull latest images
docker-compose -f deployment/docker-compose.prod.yml pull

# Deploy application
docker-compose -f deployment/docker-compose.prod.yml up -d

# Run migrations (if backend exists)
if docker-compose -f deployment/docker-compose.prod.yml ps backend | grep -q "Up"; then
    echo "Running database migrations..."
    docker-compose -f deployment/docker-compose.prod.yml exec -T backend python manage.py migrate
    docker-compose -f deployment/docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
fi

echo "✅ Deployment completed!"
echo "📊 Application status:"
docker-compose -f deployment/docker-compose.prod.yml ps
EOL

chmod +x deploy.sh

echo "✅ EC2 setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure AWS CLI: aws configure"
echo "2. Update .env file with your actual values"
echo "3. Place SSL certificates in /opt/mishmob/ssl/"
echo "4. Set up your GitHub repository and connect it"
echo "5. Run ./deploy.sh to start the application"
echo ""
echo "🔧 Useful commands:"
echo "  - Start application: sudo systemctl start mishmob"
echo "  - Check logs: docker-compose -f deployment/docker-compose.prod.yml logs -f"
echo "  - Deploy updates: ./deploy.sh"