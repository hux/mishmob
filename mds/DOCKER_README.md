# MishMob Docker Development Environment

This Docker setup provides a complete development environment with hot-reloading for both frontend and backend.

## Architecture

- **Frontend**: React app with Vite (Port 8080)
- **Backend**: Django REST API (Port 9000)
- **Database**: PostgreSQL 15 (Port 5433)

All services are containerized and connected via Docker networking.

## Prerequisites

- Docker and Docker Compose
- [Just](https://github.com/casey/just) command runner
  - macOS: `brew install just`
  - Linux: See [installation guide](https://github.com/casey/just#installation)

## Quick Start

```bash
# Show available commands
just

# Start all services
just up

# View logs
just logs

# Stop services
just down
```

## Service URLs

- Frontend: http://localhost:8080
- Backend API: http://localhost:9000/api
- Django Admin: http://localhost:9000/admin
  - Username: `admin`
  - Password: `admin123`

## Features

### Hot Reloading
- **Frontend**: Any changes to React/TypeScript files are instantly reflected
- **Backend**: Django automatically reloads on Python file changes

### Volume Mounts
The following directories are mounted for development:
- Frontend: `/src`, `/public`, `index.html`
- Backend: Entire `/backend` directory

### Database
- PostgreSQL data is persisted in a Docker volume
- Database schema is automatically applied on first run
- Migrations run automatically on container start

## Common Tasks

### Access Django Shell
```bash
just shell
python manage.py shell
```

### Access Database
```bash
just dbshell
```

### Run Migrations Manually
```bash
just migrate
```

### Create a New Django App
```bash
just startapp appname
```

### Manage Commands
```bash
# Run any Django manage.py command
just manage <command>

# Examples:
just manage createsuperuser
just manage showmigrations
just manage collectstatic
```

### Install New Python Package
```bash
# Install and update requirements.txt automatically
just pip-install package-name

# Or manually:
# 1. Add to backend/requirements.txt
# 2. Rebuild: just build backend
```

### Install New NPM Package
```bash
# Install as dependency
just npm-install package-name

# Install as dev dependency
just npm-install-dev package-name
```

## Troubleshooting

### Port Already in Use
If you see port conflicts:
1. Check what's using the port: `lsof -i :8080` (or 9000, 5433)
2. Stop the conflicting service or change ports in `docker-compose.dev.yml`

### Database Connection Issues
If the backend can't connect to the database:
1. Ensure the database container is healthy: `docker ps`
2. Check database logs: `docker-compose -f docker-compose.dev.yml logs db`

### Hot Reload Not Working
1. Check that volumes are properly mounted: `docker-compose -f docker-compose.dev.yml ps`
2. Restart the affected service: `docker-compose -f docker-compose.dev.yml restart frontend`

### Clean Slate
To completely reset the environment:
```bash
just clean
just up
```

## Development Workflow

1. Start the environment: `just up`
2. Make your code changes - they'll hot-reload automatically
3. Check logs if needed: `just logs` or `just log backend`
4. Access shells for debugging: `just shell` or `just dbshell`
5. Stop when done: `just down`

## Additional Commands

```bash
# Build/rebuild containers
just build            # Build all
just build-service backend  # Build specific service

# Update everything (rebuild with no cache)
just update

# Testing
just test             # Run backend tests
just test-frontend    # Run frontend tests
just test-coverage    # Run with coverage report

# Code quality
just lint            # Run linters
just format          # Auto-format code
just check           # Check code style

# Database operations
just reset-db        # Reset database (warning: deletes all data!)
just backup-db       # Backup database to backups/
just restore-db file # Restore from backup

# Utilities
just ps              # Show service status
just stats           # Show resource usage
just info            # Show environment info
just admin           # Open Django admin in browser
just frontend        # Open frontend in browser
```

## Notes

- The first run will take longer as Docker builds the images
- Database migrations run automatically on each container start
- Node modules and Python packages are cached in Docker volumes for faster restarts
- All services run in development mode with debug enabled