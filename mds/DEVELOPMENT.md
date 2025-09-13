# MishMob Development Setup

## Port Configuration

To avoid conflicts with other development environments, MishMob uses the following ports:

- **Frontend (Vite)**: Port 8080
- **Backend (Django)**: Port 9000
- **PostgreSQL (Docker)**: Port 5433 (maps to container's 5432)

## Quick Start - Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- [Just](https://github.com/casey/just) command runner installed
  - macOS: `brew install just`
  - Linux: `curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin`
- No services running on ports 8080, 9000, or 5433

### Running with Docker

1. Start all services:
   ```bash
   just up
   ```

2. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:9000/api
   - Django Admin: http://localhost:9000/admin

3. View logs:
   ```bash
   just logs
   ```

4. Stop services:
   ```bash
   just down
   ```

### Common Commands

- `just` - Show all available commands
- `just up` - Start all services
- `just down` - Stop all services
- `just logs` - View logs (or `just log <service>` for specific service)
- `just shell` - Access backend shell
- `just dbshell` - Access PostgreSQL shell
- `just migrate` - Run Django migrations
- `just build` - Rebuild containers
- `just update` - Update dependencies and rebuild
- `just clean` - Stop and remove all data
- `just test` - Run tests
- `just lint` - Run linters
- `just format` - Format code

### Hot Reloading

Both frontend and backend support hot reloading:
- Frontend: Changes to files in `/src`, `/public`, etc. will trigger Vite's hot reload
- Backend: Changes to Python files will trigger Django's auto-reload

## Quick Start - Manual Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create the database (make sure PostgreSQL is running):
   ```bash
   createdb mishmob_db
   ```

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the Django server on port 9000:
   ```bash
   python manage.py runserver 9000
   # OR use the convenience script:
   ./run_server.sh
   ```

### Frontend Setup

1. In the root directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server (runs on port 8080):
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env in /backend)
```env
SECRET_KEY=django-insecure-dev-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=mishmob_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

### Frontend (.env.development in root)
```env
VITE_API_URL=http://localhost:9000/api
```

## Accessing the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:9000/api
- Django Admin: http://localhost:9000/admin

## Testing the Setup

1. Register a new user at http://localhost:8080/register
2. Login at http://localhost:8080/login
3. Access the dashboard at http://localhost:8080/dashboard

## Common Issues

### Port Already in Use
If you see "Port 9000 is already in use", you can:
1. Kill the process using the port: `lsof -ti:9000 | xargs kill -9`
2. Or use a different port: `python manage.py runserver 9001`

### CORS Errors
Make sure the frontend URL (http://localhost:8080) is in the `CORS_ALLOWED_ORIGINS` setting in the backend .env file.

### Database Connection Failed
Ensure PostgreSQL is running:
- macOS: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`
- Windows: Check PostgreSQL service in Services app