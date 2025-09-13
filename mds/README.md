# MishMob - Mission Mobilization Platform

MishMob connects skilled volunteers with meaningful opportunities to make an impact in their communities through AI-powered matching.

## 🏗️ Repository Structure

```
mishmob/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Django REST API backend
├── infra/            # Infrastructure and deployment configurations
│   ├── kubernetes/   # K8s manifests
│   ├── helm/        # Helm charts
│   └── terraform/   # Infrastructure as code
├── docker-compose.dev.yml  # Local development environment
└── Justfile         # Command runner for common tasks
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- [Just](https://github.com/casey/just) command runner
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Development with Docker (Recommended)

```bash
# Start all services
just up

# View logs
just logs

# Stop services
just down
```

Access the application:
- Frontend: http://localhost:8080
- Backend API: http://localhost:9000/api
- API Documentation: http://localhost:9000/api/docs
- Django Admin: http://localhost:9000/admin (admin/admin123)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** + **shadcn/ui** for styling
- **TanStack Query** for server state
- **React Router** for navigation

### Backend
- **Django 5.1** with Python 3.11
- **Django Ninja** for REST API
- **PostgreSQL** with PostGIS
- **JWT** authentication
- **Pydantic** for validation

### Infrastructure
- **Hosting**: AWS EC2 with Docker Compose
- **Database**: Aurora Serverless v2 (scales 0.5-4 ACUs)
- **CDN**: CloudFront (optional)
- **SSL**: Let's Encrypt or AWS Certificate Manager
- **CI/CD**: GitHub Actions

## 📦 Tech Stack

**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- TanStack Query, React Router
- Lucide Icons

**Backend:**
- Django 5.0, Django Ninja
- PostgreSQL, Redis
- AWS SDK, Boto3
- Gunicorn, Uvicorn

**DevOps:**
- Docker, Docker Compose
- GitHub Actions
- AWS ECR, AWS Aurora
- Nginx reverse proxy

## 🔧 Environment Setup

### Required AWS Resources
1. **Aurora Serverless v2 Cluster** - PostgreSQL database
2. **ECR Repository** - Docker image storage  
3. **S3 Bucket** - Media file storage
4. **IAM Roles** - EC2 and Lambda permissions
5. **VPC & Security Groups** - Network configuration

### GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY  
AWS_REGION
EC2_HOST
EC2_USERNAME
EC2_SSH_KEY
```

## 🚀 Deployment Flow

1. **Code Push** → GitHub triggers Actions
2. **Frontend Build** → TypeScript compilation + Vite build
3. **Backend Build** → Docker image pushed to ECR
4. **EC2 Deploy** → SSH deployment with zero-downtime
5. **Database Migrations** → Automatic Django migrations
6. **Health Checks** → Verify deployment success

## 📊 Features

### For Volunteers
- 🎯 **AI Skills Matching** - Upload resume for personalized recommendations
- 📍 **Location-Based Search** - Find local opportunities
- 📈 **Impact Tracking** - Dashboard showing hours and lives impacted
- 🏆 **Skill Development** - Verified competency building
- ⭐ **Community Ratings** - Peer feedback and endorsements

### For Organizations  
- 📝 **Opportunity Management** - Easy posting and volunteer management
- 👥 **Team Building** - Recruit skilled volunteers
- 📊 **Impact Analytics** - Track program effectiveness
- 🎓 **Volunteer Training** - Built-in skill development paths

## 🔒 Security

- **Authentication**: JWT tokens with secure refresh
- **Authorization**: Role-based access control
- **Data Protection**: GDPR-compliant user data handling
- **API Security**: Rate limiting, CORS, input validation
- **Infrastructure**: VPC isolation, security groups, SSL/TLS

## 📈 Scalability

- **Database**: Aurora Serverless auto-scales (0.5-4 ACUs)
- **API**: Horizontal scaling via load balancer
- **Static Assets**: CDN distribution
- **Caching**: Redis for sessions and API responses
- **Monitoring**: CloudWatch + application metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [View detailed setup guide](backend-scaffold/README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/mishmob-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mishmob-frontend/discussions)

---

**Built with ❤️ for stronger communities**
