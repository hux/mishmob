# MishMob Project Structure

## Repository Layout

```
mishmob/
├── web/                  # React TypeScript Web Application
│   ├── src/              # Source code
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts (Auth, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── lib/          # Utilities
│   ├── public/           # Static assets
│   ├── package.json      # NPM dependencies
│   ├── vite.config.ts    # Vite configuration
│   ├── tsconfig.json     # TypeScript config
│   └── Dockerfile        # Web Docker config
│
├── mobile/               # React Native Mobile App
│   ├── src/              # Source code
│   │   ├── components/   # Mobile UI components
│   │   ├── screens/      # Screen components
│   │   ├── navigation/   # Navigation setup
│   │   ├── services/     # API service layer
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilities
│   ├── android/          # Android specific code
│   ├── ios/              # iOS specific code
│   ├── package.json      # NPM dependencies
│   ├── metro.config.js   # Metro bundler config
│   └── Dockerfile        # Mobile build Docker config
│
├── backend/              # Django REST API
│   ├── api/             # API app with routers
│   ├── users/           # User management app
│   ├── opportunities/   # Opportunities app
│   ├── lms/            # Learning management app
│   ├── mishmob/        # Django project settings
│   ├── manage.py       # Django CLI
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile      # Backend Docker config
│
├── shared/              # Shared code between web & mobile
│   ├── api-types/       # TypeScript API type definitions
│   ├── constants/       # Shared constants
│   └── utils/           # Shared utility functions
│
├── infra/               # Infrastructure & Deployment
│   ├── docker/          # Docker configurations
│   ├── kubernetes/      # K8s manifests
│   └── terraform/       # Infrastructure as code
│
├── docker-compose.yml    # Local development orchestration
├── Justfile             # Command runner
├── README.md            # Main documentation
└── CLAUDE.md            # AI context guide
```

## Key Architectural Decisions

### 1. Separate Web and Mobile
- **Web**: React with Vite for optimal web performance
- **Mobile**: React Native for cross-platform mobile development
- **Shared**: Common TypeScript types and utilities in `/shared`

### 2. Unified Backend API
- Single Django backend serves both web and mobile clients
- Django Ninja for modern, FastAPI-style endpoints
- JWT authentication for stateless API access

### 3. Development Environment
- Docker Compose orchestrates all services locally
- Hot reloading for all frontends and backend
- Shared volume mounts for the `/shared` directory

## Development Commands

### Using Justfile
```bash
# Start all services
just up

# Start specific service
just up-web
just up-mobile
just up-backend

# View logs
just logs
just logs-web

# Run migrations
just migrate

# Create superuser
just createsuperuser

# Install dependencies
just install-web
just install-mobile
just install-backend
```

## Port Assignments
- **Web Frontend**: http://localhost:5173
- **Mobile Metro**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## Mobile App Features (React Native)
- QR code check-in for events
- Location-based discovery
- Push notifications
- Offline capability
- Native performance

## Web App Features (React)
- Full dashboard experience
- Rich text editing
- Data visualizations
- Admin interfaces
- SEO optimization