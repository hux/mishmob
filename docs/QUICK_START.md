# MishMob Quick Start Guide

Get the MishMob platform running on your machine in minutes!

## 📋 Prerequisites

Ensure you have the following installed:
- **Docker Desktop** (includes Docker Compose)
- **Node.js 18+** and npm
- **Git**
- **Make** (usually pre-installed on macOS/Linux)

Optional for mobile development:
- **Xcode** (iOS development - macOS only)
- **Android Studio** (Android development)

## 🚀 5-Minute Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mishmob
```

### 2. Run the Setup Script
```bash
# This installs dependencies and configures the environment
./setup.sh
```

### 3. Start All Services
```bash
# Start Docker containers for all services
make dev
```

### 4. Access the Applications

| Application | URL | Credentials |
|------------|-----|-------------|
| **Frontend** | http://localhost:8081 | Create account or use test user |
| **Backend API** | http://localhost:8080 | - |
| **API Docs** | http://localhost:8080/api/docs | - |
| **Django Admin** | http://localhost:8080/admin | admin / admin123 |

## 🎯 Quick Development Tasks

### Backend Development

```bash
# Start only backend services
make backend-dev

# Access Django shell
make dev-shell

# Run migrations
make dev-migrate

# Create a superuser
make dev-createsuperuser

# View backend logs
make dev-logs backend

# Run backend tests
make test-backend
```

### Frontend Development

```bash
# Start only frontend
make frontend-dev

# Install frontend dependencies
cd frontend && npm install

# Run frontend tests
make test-frontend

# Build for production
cd frontend && npm run build
```

### Mobile Development

```bash
# Setup mobile environment
make mobile-setup

# Run iOS app (macOS only)
make mobile-ios

# Run Android app
make mobile-android

# Clean and rebuild
make mobile-clean
```

## 🐳 Docker Service Management

### View Service Status
```bash
make dev-status
```

### View Logs
```bash
# All services
make dev-logs

# Specific service
make dev-logs backend
make dev-logs web
make dev-logs db
```

### Restart Services
```bash
# Stop all services
make dev-down

# Start all services
make dev-up

# Restart specific service
docker-compose restart backend
```

### Clean Up
```bash
# Stop and remove all containers
make dev-clean

# Remove all data (database, search index, etc.)
make dev-clean-all
```

## 🗄️ Database Operations

### Apply Migrations
```bash
make dev-migrate
```

### Create Migrations
```bash
docker-compose exec backend python manage.py makemigrations
```

### Load Sample Data
```bash
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

### Access Database
```bash
# PostgreSQL shell
make dev-db-shell

# Or direct connection
psql postgresql://postgres:postgres@localhost:5433/mishmob_db
```

## 🔧 Environment Configuration

### Backend Environment Variables
Create `.env` in the backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres@db:5432/mishmob_db
REDIS_URL=redis://redis:6379/0
MEILISEARCH_URL=http://search:7700
MEILISEARCH_KEY=masterKey
```

### Frontend Environment Variables
Create `.env` in the frontend directory:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=MishMob
```

## 📝 Common Development Workflows

### Add a New Feature

1. **Backend API Endpoint**
```bash
# Create new router in backend/api/routers/
# Add router to backend/api/urls.py
make dev-migrate  # If models changed
make dev-restart backend
```

2. **Frontend Page**
```bash
# Create component in frontend/src/pages/
# Add route in frontend/src/App.tsx
# Frontend hot-reloads automatically
```

3. **Test the Feature**
```bash
# Backend tests
make test-backend

# Frontend tests
make test-frontend
```

### Fix a Bug

1. **Identify the Issue**
```bash
# Check logs
make dev-logs

# Access Django shell for debugging
make dev-shell
```

2. **Make Changes**
- Edit files locally (they're mounted in containers)
- Backend changes auto-reload
- Frontend changes hot-reload

3. **Test the Fix**
```bash
# Run specific test
docker-compose exec backend pytest path/to/test.py
```

## 🌐 Service Ports Reference

| Service | External Port | Internal Port | Purpose |
|---------|--------------|---------------|---------|
| Frontend | 8081 | 8081 | React development server |
| Backend | 8080 | 8000 | Django API server |
| PostgreSQL | 5433 | 5433 | Database |
| Meilisearch | 7701 | 7700 | Search engine |
| Redis | 6380 | 6379 | Cache & queue |
| Metro | 8085 | 8085 | React Native bundler |

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different ports in docker-compose.override.yml
```

### Docker Issues
```bash
# Reset Docker
make dev-clean-all
docker system prune -a
./setup.sh
make dev
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db

# Recreate database
make dev-clean-db
make dev-migrate
```

### Frontend Not Loading
```bash
# Check if API is accessible
curl http://localhost:8080/api/health

# Rebuild frontend
cd frontend
npm install
npm run dev
```

## 📚 Next Steps

Now that you have MishMob running:

1. **Explore the Code**
   - Backend: `/backend/api/routers/`
   - Frontend: `/frontend/src/pages/`
   - Mobile: `/mobile/src/screens/`

2. **Read the Documentation**
   - [Repository Overview](./REPOSITORY_OVERVIEW.md)
   - [Frontend Guide](./frontend/ARCHITECTURE.md)
   - [Backend Guide](./backend/ARCHITECTURE.md)
   - [API Documentation](./api/README.md)

3. **Join Development**
   - Check [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md)
   - Pick an issue from GitHub
   - Read [Contributing Guide](./development/CONTRIBUTING.md)

## 🆘 Getting Help

- **Documentation**: Check the `/docs` folder
- **Logs**: `make dev-logs`
- **Django Shell**: `make dev-shell`
- **API Docs**: http://localhost:8080/api/docs
- **GitHub Issues**: Report bugs and ask questions

## 🎉 Success Checklist

You know you're set up correctly when:
- [ ] Frontend loads at http://localhost:8081
- [ ] API docs show at http://localhost:8080/api/docs
- [ ] Can create a user account
- [ ] Can log in and see dashboard
- [ ] Docker shows 5 running services: `make dev-status`

---

Happy coding! Welcome to MishMob development! 🚀