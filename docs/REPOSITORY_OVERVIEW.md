# MishMob Repository Overview

## 🎯 Project Vision

MishMob (Mission Mobilization) is a community volunteer matching platform that connects skilled volunteers with meaningful opportunities using AI-powered matching. The platform envisions a world where purpose, meaning, and belonging are accessible to everyone through action.

## 🏗️ Repository Structure

```
mishmob/
├── backend/                 # Django REST API (Port 8080)
├── frontend/               # React TypeScript Web App (Port 8081)
├── mobile/                 # React Native CLI App (Port 8085)
├── mobile-cli/             # Alternative mobile setup
├── shared/                 # Shared TypeScript types & constants
├── infra/                  # Infrastructure & Deployment configs
├── scripts/                # Automation & setup scripts (26 files)
├── docs/                   # Documentation
├── .github/                # GitHub Actions CI/CD
├── docker-compose.yml      # Local development orchestration
├── Makefile               # Development commands (464 lines)
├── setup.sh               # Initial project setup script
└── CLAUDE.md              # AI assistant context guide
```

## 🛠️ Technology Stack

### Frontend (Web)
- **Framework**: React 18.3.1 + TypeScript 5.8
- **Build Tool**: Vite 7.1 with SWC
- **UI Library**: shadcn/ui (Radix UI based components)
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **State**: TanStack Query 5.87
- **Forms**: React Hook Form 7.62 + Zod 3.25
- **Routing**: React Router v6 30.1
- **Charts**: Recharts 2.15
- **Icons**: Lucide React 0.544

### Backend (API)
- **Framework**: Django 5.1.3 + Django Ninja 1.3
- **Database**: PostgreSQL 16 with psycopg3
- **Authentication**: JWT + django-allauth 65.3
- **Queue**: Celery 5.4 + Redis 5.2
- **Search**: Meilisearch 1.11
- **Storage**: AWS S3 via boto3
- **Validation**: Pydantic 2.10
- **Testing**: pytest 8.3 + pytest-django

### Mobile
- **Framework**: React Native 0.81.4 (CLI, not Expo)
- **React**: 19.1.0 (latest experimental)
- **Navigation**: React Navigation 7.0
- **UI**: React Native Paper 5.12
- **Camera**: Vision Camera 4.7
- **QR**: react-native-qrcode-scanner 1.5
- **Storage**: AsyncStorage + Keychain

### Infrastructure
- **Containers**: Docker & Docker Compose
- **Orchestration**: Kubernetes with Kustomize
- **Charts**: Helm for K8s deployments
- **IaC**: Terraform for AWS/GCP
- **Proxy**: Nginx for production
- **CI/CD**: GitHub Actions

## 📁 Key Directories

### `/backend` - Django API
```
backend/
├── mishmob/           # Django project settings
├── api/               # Django Ninja API app
│   └── routers/       # API endpoint definitions
├── users/             # User management & profiles
├── opportunities/     # Opportunities & applications
├── events/           # Event management
├── lms/              # Learning Management System
├── messaging/        # Chat & notifications
└── manage.py         # Django CLI
```

### `/frontend` - React Web App
```
frontend/
├── src/
│   ├── components/
│   │   └── ui/       # shadcn/ui components (50+ files)
│   ├── pages/        # Page components (33 pages)
│   ├── contexts/     # React contexts (Auth)
│   ├── services/     # API client functions
│   ├── hooks/        # Custom React hooks
│   └── App.tsx       # Main app with routing
├── public/           # Static assets
└── vite.config.ts    # Build configuration
```

### `/mobile` - React Native App
```
mobile/
├── src/
│   ├── screens/      # App screens by feature
│   │   ├── auth/     # Login, Register
│   │   ├── main/     # Home, Opportunities, Profile
│   │   └── events/   # Events, QR scanning
│   ├── components/   # Reusable components
│   ├── navigation/   # Navigation setup
│   └── services/     # API integration
├── android/          # Android native code
├── ios/              # iOS native code
└── package.json      # Dependencies
```

### `/infra` - Infrastructure
```
infra/
├── k8s/              # Kubernetes configs
│   ├── base/         # Base K8s resources
│   └── overlays/     # Environment-specific
├── helm/             # Helm charts
├── terraform/        # Cloud provisioning
└── deployment/       # Deploy scripts
```

## 🗄️ Data Models

### Core Models
- **User**: Custom user with volunteer/host/admin types
- **UserProfile**: Bio, LinkedIn, resume, parsed skills
- **Skill**: Technical/Creative/Leadership categories
- **UserSkill**: M2M with proficiency levels
- **Opportunity**: Title, description, dates, location
- **Role**: Positions within opportunities
- **Application**: Volunteer applications to roles
- **Event**: In-person community events
- **Course**: LMS courses for training
- **Message**: User messaging system

## 🔌 API Structure

### Authentication (`/api/auth/`)
- `POST /register` - Create new user
- `POST /login` - Get JWT token
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Invalidate token

### Opportunities (`/api/opportunities/`)
- `GET /` - List/search opportunities
- `GET /{id}` - Get opportunity details
- `POST /` - Create opportunity (hosts)
- `PUT /{id}` - Update opportunity
- `POST /{id}/apply` - Apply for role

### Users (`/api/users/`)
- `GET /me` - Current user profile
- `PUT /me` - Update profile
- `POST /me/upload-resume` - Resume parsing
- `GET /skills` - Search skills

### Events (`/api/events/`)
- `GET /` - List events
- `POST /{id}/register` - Register for event
- `GET /{id}/ticket` - Get QR ticket
- `POST /{id}/checkin` - QR check-in

### LMS (`/api/lms/`)
- `GET /courses` - Available courses
- `POST /courses/{id}/enroll` - Enroll
- `GET /my-courses` - User's courses
- `PUT /modules/{id}/complete` - Mark complete

## 🐳 Docker Services

```yaml
services:
  db:       # PostgreSQL 16 on port 5433
  backend:  # Django on port 8080
  web:      # React on port 8081
  search:   # Meilisearch on port 7701
  redis:    # Redis on port 6380
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ & npm
- Python 3.11+
- Make (for Makefile commands)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd mishmob

# Run setup script
./setup.sh

# Start all services
make dev

# Access applications
# Frontend: http://localhost:8081
# Backend API: http://localhost:8080
# API Docs: http://localhost:8080/api/docs
```

### Common Commands
```bash
# Development
make dev              # Start all services
make dev-status       # Check service status
make dev-logs         # View logs
make dev-shell        # Backend shell
make dev-migrate      # Run migrations

# Mobile
make mobile-setup     # Install dependencies
make mobile-ios       # Run iOS app
make mobile-android   # Run Android app

# Testing
make test            # Run all tests
make test-backend    # Backend tests only
make test-frontend   # Frontend tests only

# Production
make build           # Build images
make deploy          # Deploy to K8s
```

## 📊 Project Stats

- **Frontend**: 33+ page components, 50+ UI components
- **Backend**: 8 Django apps, 15+ API routers
- **Mobile**: React Native CLI with QR scanning
- **Scripts**: 26 automation scripts
- **Makefile**: 464 lines of commands
- **Docker**: 5 services orchestrated

## 🔗 Key Files

### Configuration
- `docker-compose.yml` - Service orchestration
- `Makefile` - All development commands
- `backend/mishmob/settings.py` - Django config
- `frontend/vite.config.ts` - Frontend build
- `mobile/metro.config.js` - Mobile bundler

### Documentation
- `CLAUDE.md` - AI assistant context
- `README.md` - Project introduction
- `PROJECT_STRUCTURE.md` - Architecture details
- `PORT_MAPPING.md` - Service port reference
- `DEVELOPMENT_STATUS.md` - Feature progress

## 🎨 Design System

### Colors
- Primary: Purpose Blue (`hsl(214 84% 56%)`)
- Secondary: Community Orange (`hsl(25 95% 53%)`)
- Accent: Growth Green (`hsl(142 76% 36%)`)

### UI Patterns
- Card-based layouts
- Gradient overlays
- Mobile-first responsive
- Dark mode support

## 🔐 Security Features

- JWT authentication with refresh tokens
- Social login (Google, Facebook, Apple, LinkedIn)
- CORS configuration
- Environment variable management
- SSL/TLS in production
- Background check integration (planned)

## 📈 Current Status

### Completed ✅
- Full project scaffolding
- Backend API with auth
- Frontend with 33+ pages
- Mobile app with QR
- Docker environment
- Database models
- Web scraping

### In Progress 🚧
- AI skills matching
- Push notifications
- Real-time messaging
- Impact analytics

### Planned 📋
- Resume parsing
- Background checks
- Advanced search
- Analytics dashboard

## 🤝 Contributing

See [Contributing Guide](./development/CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Testing requirements
- PR process

## 📞 Support

- GitHub Issues: Report bugs and request features
- Documentation: This docs folder
- AI Context: CLAUDE.md file

---

Last updated: October 2024