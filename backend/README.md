# MishMob Backend

Django backend for the MishMob volunteer matching platform.

## Setup Instructions

### 1. Prerequisites
- Python 3.11+ (tested with 3.13)
- PostgreSQL 14+ with PostGIS extension
- Virtual environment tool (venv)

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb mishmob_db

# Or using psql
psql -U postgres
CREATE DATABASE mishmob_db;
\q
```

### 3. Environment Setup

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# Make sure to update:
# - DATABASE_PASSWORD
# - SECRET_KEY (generate a new one for production)
```

### 4. Python Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-initial.txt
```

### 5. Django Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic --noinput
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The backend will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access:
- API Documentation: http://localhost:8000/api/docs
- Admin Panel: http://localhost:8000/admin/

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user details

### Opportunities
- `GET /api/opportunities/` - List/search opportunities
- `GET /api/opportunities/featured` - Get featured opportunities
- `GET /api/opportunities/{id}` - Get opportunity details
- `POST /api/opportunities/{id}/apply` - Apply to opportunity

## Project Structure

```
backend/
├── mishmob/          # Django project settings
├── users/            # User management app
├── opportunities/    # Opportunities and projects app
├── lms/             # Learning management system app
├── api/             # API endpoints using Django Ninja
│   └── routers/     # API route handlers
├── media/           # User uploaded files
├── static/          # Static files
└── manage.py        # Django management script
```

## Testing

```bash
# Run tests
python manage.py test

# Run with coverage
pytest --cov=.
```

## Development Workflow

1. Always work in the virtual environment
2. Run migrations after model changes
3. Use the admin panel to manage data
4. Check API docs for endpoint testing

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in .env
- Make sure database exists

### Migration Errors
- Delete migration files (keep __init__.py)
- Run `python manage.py makemigrations`
- Run `python manage.py migrate`

### CORS Issues
- Check CORS_ALLOWED_ORIGINS in settings
- Ensure frontend URL is included

## Next Steps

1. Set up additional API endpoints for:
   - User profiles and skills
   - Project management
   - LMS functionality
   
2. Implement:
   - JWT authentication middleware
   - File upload handling
   - Email notifications
   - Background tasks with Celery

3. Add tests for all endpoints

4. Set up CI/CD pipeline