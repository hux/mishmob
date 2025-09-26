# Getting Started with MishMob

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)
- Python 3.11+ (for local backend development without Docker)
- PostgreSQL (if running without Docker)

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mishmob.git
cd mishmob
```

2. Create environment files:
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment (already included)
# frontend/.env is already set up
```

3. Start all services:
```bash
docker-compose up -d
```

4. Wait for services to initialize (first run will take a few minutes):
```bash
docker-compose logs -f
```

5. Run database migrations:
```bash
docker-compose exec backend python manage.py migrate
```

6. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

7. Access the applications:
- Web Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/docs
- Django Admin: http://localhost:8000/admin
- Meilisearch: http://localhost:7700

## Development Workflow

### Backend Development

1. Make changes to Django code
2. The development server will auto-reload
3. Run migrations if you change models:
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Frontend Development

1. Make changes to React code
2. Vite will hot-reload automatically
3. Install new packages:
```bash
docker-compose exec web npm install package-name
```

### API Documentation

The API documentation is automatically generated and available at:
- http://localhost:8000/api/docs (Swagger UI)

### Running Tests

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec web npm test
```

## Troubleshooting

### Port Already in Use

If you get port conflicts, you can change the ports in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change 8001 to any available port
```

### Database Connection Issues

Make sure the database service is healthy:
```bash
docker-compose ps
docker-compose logs db
```

### Frontend Can't Connect to Backend

1. Check CORS settings in backend
2. Verify the API URL in frontend/.env
3. Make sure backend is running: `docker-compose ps backend`

## Next Steps

1. Review the [Project Structure](PROJECT_STRUCTURE.md)
2. Read the [CLAUDE.md](CLAUDE.md) for AI context
3. Check out the [Implementation Plan](IMPLEMENTATION_PLAN.md)
4. Start building features!

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f web

# Shell access
docker-compose exec backend bash
docker-compose exec web sh

# Django shell
docker-compose exec backend python manage.py shell

# Database shell
docker-compose exec db psql -U postgres mishmob_db
```