# MishMob Documentation

Welcome to the MishMob documentation! This guide will help you understand, develop, and contribute to the MishMob platform.

## 📚 Documentation Structure

### Getting Started
- [Repository Overview](./REPOSITORY_OVERVIEW.md) - Complete project structure and technology stack
- [Quick Start Guide](./QUICK_START.md) - Get up and running in minutes
- [Development Setup](./development/SETUP.md) - Detailed development environment setup

### Architecture & Design
- [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md) - High-level system design
- [Technology Stack](./architecture/TECH_STACK.md) - Detailed technology choices and rationale
- [Database Schema](./architecture/DATABASE_SCHEMA.md) - Data model and relationships
- [API Design](./api/API_DESIGN.md) - RESTful API principles and patterns

### Component Documentation

#### Frontend (React)
- [Frontend Architecture](./frontend/ARCHITECTURE.md) - React app structure and patterns
- [Components Guide](./frontend/COMPONENTS.md) - UI component library reference
- [Pages & Routing](./frontend/PAGES.md) - Page components and navigation
- [State Management](./frontend/STATE_MANAGEMENT.md) - Data fetching and state patterns
- [Styling Guide](./frontend/STYLING.md) - Tailwind CSS and theming

#### Backend (Django)
- [Backend Architecture](./backend/ARCHITECTURE.md) - Django project structure
- [API Endpoints](./api/ENDPOINTS.md) - Complete API reference
- [Models & Database](./backend/MODELS.md) - Django models documentation
- [Authentication](./backend/AUTHENTICATION.md) - Auth system and JWT tokens
- [Background Tasks](./backend/CELERY.md) - Async tasks with Celery

#### Mobile (React Native)
- [Mobile Architecture](./mobile/ARCHITECTURE.md) - React Native app structure
- [Navigation](./mobile/NAVIGATION.md) - App navigation patterns
- [Native Features](./mobile/NATIVE_FEATURES.md) - Camera, QR scanning, permissions
- [Deployment](./mobile/DEPLOYMENT.md) - App store deployment guides

### Infrastructure & Deployment
- [Docker Setup](./infrastructure/DOCKER.md) - Container configuration
- [Kubernetes](./infrastructure/KUBERNETES.md) - K8s deployment guides
- [CI/CD Pipeline](./infrastructure/CICD.md) - GitHub Actions workflows
- [Production Deployment](./infrastructure/PRODUCTION.md) - Deploy to cloud providers

### Development Guides
- [Development Workflow](./development/WORKFLOW.md) - Git flow and best practices
- [Testing Guide](./development/TESTING.md) - Unit, integration, and E2E testing
- [Code Style](./development/CODE_STYLE.md) - Coding standards and linting
- [Contributing](./development/CONTRIBUTING.md) - How to contribute to MishMob

### API Documentation
- [API Overview](./api/README.md) - API introduction and conventions
- [Authentication API](./api/auth.md) - Login, register, JWT tokens
- [Opportunities API](./api/opportunities.md) - Opportunity CRUD operations
- [Users API](./api/users.md) - User profiles and skills
- [Events API](./api/events.md) - Event management and tickets
- [LMS API](./api/lms.md) - Learning management system
- [Messages API](./api/messages.md) - Messaging and notifications

### Guides & Tutorials
- [Common Tasks](./guides/COMMON_TASKS.md) - Quick reference for frequent operations
- [Adding Features](./guides/ADDING_FEATURES.md) - Step-by-step feature development
- [Troubleshooting](./guides/TROUBLESHOOTING.md) - Common issues and solutions
- [Performance](./guides/PERFORMANCE.md) - Optimization tips

## 🚀 Quick Links

### For New Developers
1. Start with [Repository Overview](./REPOSITORY_OVERVIEW.md)
2. Follow [Quick Start Guide](./QUICK_START.md)
3. Read [Development Workflow](./development/WORKFLOW.md)

### For Frontend Developers
1. [Frontend Architecture](./frontend/ARCHITECTURE.md)
2. [Components Guide](./frontend/COMPONENTS.md)
3. [Styling Guide](./frontend/STYLING.md)

### For Backend Developers
1. [Backend Architecture](./backend/ARCHITECTURE.md)
2. [API Endpoints](./api/ENDPOINTS.md)
3. [Models & Database](./backend/MODELS.md)

### For Mobile Developers
1. [Mobile Architecture](./mobile/ARCHITECTURE.md)
2. [Native Features](./mobile/NATIVE_FEATURES.md)
3. [Deployment Guide](./mobile/DEPLOYMENT.md)

### For DevOps Engineers
1. [Docker Setup](./infrastructure/DOCKER.md)
2. [Kubernetes Guide](./infrastructure/KUBERNETES.md)
3. [Production Deployment](./infrastructure/PRODUCTION.md)

## 📋 Port Reference

| Service | External Port | Internal Port | URL |
|---------|--------------|---------------|-----|
| Django Backend | 8080 | 8000 | http://localhost:8080 |
| React Frontend | 8081 | 8081 | http://localhost:8081 |
| PostgreSQL | 5433 | 5433 | postgresql://localhost:5433/mishmob_db |
| Meilisearch | 7701 | 7700 | http://localhost:7701 |
| Redis | 6380 | 6379 | redis://localhost:6380 |
| Metro (Mobile) | 8085 | 8085 | http://localhost:8085 |

## 🛠️ Key Commands

```bash
# Start all services
make dev

# Start backend only
make backend-dev

# Start frontend only
make frontend-dev

# Run migrations
make dev-migrate

# Create superuser
make dev-createsuperuser

# View logs
make dev-logs

# Run tests
make test

# Deploy to production
make deploy
```

## 📖 Additional Resources

- [Project README](../README.md) - Main project documentation
- [CLAUDE.md](../CLAUDE.md) - AI assistant context guide
- [Makefile](../Makefile) - All available make commands
- [API Docs](http://localhost:8080/api/docs) - Interactive API documentation (when running)

## 🤝 Contributing

Please read our [Contributing Guide](./development/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

## 📝 License

This project is licensed under the terms specified in the project root.

---

Last updated: October 2024