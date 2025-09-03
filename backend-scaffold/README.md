# MishMob Backend - Django + Ninja API

## Quick Setup

### 1. Create Backend Repository Structure
```bash
mkdir backend && cd backend
```

### 2. Initialize Django Project
```bash
# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install django djangorestframework django-ninja
pip install psycopg2-binary python-decouple django-cors-headers
pip install boto3 gunicorn uvicorn

# Create Django project
django-admin startproject mishmob_api .
cd mishmob_api
python manage.py startapp opportunities
python manage.py startapp users
python manage.py startapp skills
```

### 3. Environment Configuration
Create `backend/.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/mishmob

# AWS Configuration
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=mishmob-assets
AWS_S3_REGION_NAME=us-east-1

# RDS Configuration (Aurora Serverless v2)
RDS_HOSTNAME=your-aurora-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com
RDS_PORT=5432
RDS_DB_NAME=mishmob
RDS_USERNAME=postgres
RDS_PASSWORD=your-password
```

### 4. Docker Configuration

#### Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 mishmob_api.wsgi:application"]

EXPOSE 8000
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    volumes:
      - ./:/app
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mishmob
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 5. Django Ninja API Structure

#### API Endpoints Structure
```python
# backend/mishmob_api/api.py
from ninja import NinjaAPI
from opportunities.api import router as opportunities_router
from users.api import router as users_router
from skills.api import router as skills_router

api = NinjaAPI(
    title="MishMob API",
    version="1.0.0",
    description="Community volunteer matching platform API"
)

api.add_router("/opportunities/", opportunities_router)
api.add_router("/users/", users_router)
api.add_router("/skills/", skills_router)
```

### 6. AWS Aurora Serverless v2 Setup

#### Terraform Configuration (Optional)
```hcl
resource "aws_rds_cluster" "mishmob" {
  cluster_identifier      = "mishmob-aurora-cluster"
  engine                 = "aurora-postgresql"
  engine_mode           = "provisioned"
  engine_version        = "15.4"
  database_name         = "mishmob"
  master_username       = "postgres"
  master_password       = var.db_password
  
  serverlessv2_scaling_configuration {
    max_capacity = 4.0
    min_capacity = 0.5
  }
  
  skip_final_snapshot = true
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.mishmob.name
}

resource "aws_rds_cluster_instance" "mishmob" {
  identifier          = "mishmob-aurora-instance"
  cluster_identifier  = aws_rds_cluster.mishmob.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.mishmob.engine
  engine_version      = aws_rds_cluster.mishmob.engine_version
}
```

### 7. Deployment Script

#### deploy.sh
```bash
#!/bin/bash
set -e

echo "🚀 Starting MishMob Backend Deployment..."

# Build and push to ECR
docker build -t mishmob-backend .
docker tag mishmob-backend:latest $ECR_REGISTRY/mishmob-backend:latest
docker push $ECR_REGISTRY/mishmob-backend:latest

# Deploy to EC2
ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST << 'EOF'
  cd /opt/mishmob
  docker-compose pull backend
  docker-compose up -d backend
  docker-compose exec backend python manage.py migrate
EOF

echo "✅ Deployment completed!"
```

## API Endpoints Preview

### Opportunities API
- `GET /api/opportunities/` - List all opportunities
- `POST /api/opportunities/` - Create opportunity
- `GET /api/opportunities/{id}/` - Get opportunity details
- `POST /api/opportunities/{id}/apply/` - Apply to opportunity

### Users API
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User authentication
- `GET /api/users/profile/` - Get user profile
- `POST /api/users/skills/` - Update user skills

### Skills API
- `GET /api/skills/` - List all skills
- `POST /api/skills/match/` - Match opportunities to skills
- `GET /api/skills/categories/` - Get skill categories

## Next Steps

1. **Create backend repository**: Set up separate GitHub repo for Django backend
2. **Configure AWS resources**: Aurora Serverless v2, ECR, IAM roles
3. **Set up CI/CD**: GitHub Actions for automated deployments
4. **Connect frontend**: Update React app to consume Django API
5. **Implement authentication**: JWT-based auth with refresh tokens
6. **Add real-time features**: WebSocket support for notifications

Would you like me to scaffold any specific part of this backend architecture?