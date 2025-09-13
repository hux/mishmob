# MishMob Development Commands
# Usage: just <command>

# Set shell for Windows compatibility
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# Load environment variables from .env.docker if it exists
set dotenv-load := true

# Aliases for common commands
alias u := up
alias d := down
alias l := logs
alias s := shell
alias m := migrate
alias t := test
alias b := build

# Default command - show available commands
default:
    @just --list --unsorted

# Start all services with hot-reloading
up:
    @echo "🚀 Starting MishMob Docker development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    @echo "✅ Services started!"
    @echo ""
    @echo "Access the application at:"
    @echo "  Frontend: http://localhost:8080"
    @echo "  Backend API: http://localhost:9000/api"
    @echo "  Django Admin: http://localhost:9000/admin"
    @echo ""
    @echo "💡 Run 'just logs' to see logs"

# Start services and show logs
up-logs:
    @echo "🚀 Starting MishMob with logs..."
    docker-compose -f docker-compose.dev.yml up

# Stop all services
down:
    @echo "🛑 Stopping services..."
    docker-compose -f docker-compose.dev.yml down
    @echo "✅ Services stopped!"

# Show logs (follow mode)
logs:
    docker-compose -f docker-compose.dev.yml logs -f

# Show logs for a specific service
log service:
    docker-compose -f docker-compose.dev.yml logs -f {{service}}

# Build/rebuild all services
build:
    @echo "🔨 Building all services..."
    docker-compose -f docker-compose.dev.yml build
    @echo "✅ Build complete!"

# Build a specific service
build-service service:
    @echo "🔨 Building {{service}}..."
    docker-compose -f docker-compose.dev.yml build {{service}}

# Update dependencies and rebuild
update:
    @echo "📦 Updating dependencies and rebuilding..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    @echo "✅ Update complete!"

# Access backend shell
shell:
    @echo "🐚 Accessing backend shell..."
    docker-compose -f docker-compose.dev.yml exec backend bash

# Access frontend shell
shell-frontend:
    @echo "🐚 Accessing frontend shell..."
    docker-compose -f docker-compose.dev.yml exec frontend sh

# Access PostgreSQL shell
dbshell:
    @echo "🗄️  Accessing PostgreSQL shell..."
    docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d mishmob_db

# Run Django migrations
migrate:
    @echo "🔄 Running Django migrations..."
    docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
    @echo "✅ Migrations complete!"

# Create Django migrations
makemigrations:
    @echo "📝 Creating Django migrations..."
    docker-compose -f docker-compose.dev.yml exec backend python manage.py makemigrations

# Run Django management command
manage *args:
    docker-compose -f docker-compose.dev.yml exec backend python manage.py {{args}}

# Run tests
test:
    @echo "🧪 Running tests..."
    docker-compose -f docker-compose.dev.yml exec backend python manage.py test

# Run backend tests with coverage
test-coverage:
    @echo "🧪 Running tests with coverage..."
    docker-compose -f docker-compose.dev.yml exec backend coverage run --source='.' manage.py test
    docker-compose -f docker-compose.dev.yml exec backend coverage report

# Run frontend tests
test-frontend:
    @echo "🧪 Running frontend tests..."
    docker-compose -f docker-compose.dev.yml exec frontend npm test

# Run linting
lint:
    @echo "🔍 Running linters..."
    @echo "Backend (Python):"
    -docker-compose -f docker-compose.dev.yml exec backend flake8 .
    @echo "\nFrontend (TypeScript/React):"
    docker-compose -f docker-compose.dev.yml exec frontend npm run lint

# Format code
format:
    @echo "✨ Formatting code..."
    @echo "Backend (Python):"
    docker-compose -f docker-compose.dev.yml exec backend black .
    @echo "\nFrontend (TypeScript/React):"
    docker-compose -f docker-compose.dev.yml exec frontend npm run format

# Install a Python package
pip-install package:
    @echo "📦 Installing {{package}}..."
    docker-compose -f docker-compose.dev.yml exec backend pip install {{package}}
    docker-compose -f docker-compose.dev.yml exec backend pip freeze > requirements.txt
    @echo "✅ Installed {{package}} and updated requirements.txt"

# Install an NPM package
npm-install package:
    @echo "📦 Installing {{package}}..."
    docker-compose -f docker-compose.dev.yml exec frontend npm install {{package}}
    @echo "✅ Installed {{package}}"

# Install an NPM dev dependency
npm-install-dev package:
    @echo "📦 Installing {{package}} as dev dependency..."
    docker-compose -f docker-compose.dev.yml exec frontend npm install -D {{package}}
    @echo "✅ Installed {{package}}"

# Create a new Django app
startapp name:
    @echo "🎯 Creating Django app '{{name}}'..."
    docker-compose -f docker-compose.dev.yml exec backend python manage.py startapp {{name}}
    @echo "✅ Created app '{{name}}'"

# Reset database
reset-db:
    @echo "⚠️  This will delete all data in the database!"
    @echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
    @sleep 5
    @echo "🗑️  Resetting database..."
    docker-compose -f docker-compose.dev.yml exec db psql -U postgres -c "DROP DATABASE IF EXISTS mishmob_db;"
    docker-compose -f docker-compose.dev.yml exec db psql -U postgres -c "CREATE DATABASE mishmob_db;"
    docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
    docker-compose -f docker-compose.dev.yml exec backend python create_superuser.py
    @echo "✅ Database reset complete!"

# Stop services and remove volumes (clean slate)
clean:
    @echo "🧹 Stopping services and removing volumes..."
    docker-compose -f docker-compose.dev.yml down -v
    @echo "✅ Cleanup complete!"

# Show service status
ps:
    docker-compose -f docker-compose.dev.yml ps

# Show container resource usage
stats:
    docker stats --no-stream $(docker-compose -f docker-compose.dev.yml ps -q)

# Restart a specific service
restart service:
    @echo "🔄 Restarting {{service}}..."
    docker-compose -f docker-compose.dev.yml restart {{service}}
    @echo "✅ {{service}} restarted!"

# View Django admin
admin:
    @echo "🌐 Opening Django admin..."
    @echo "Username: admin"
    @echo "Password: admin123"
    open http://localhost:9000/admin || xdg-open http://localhost:9000/admin || echo "Please open http://localhost:9000/admin in your browser"

# View frontend
frontend:
    @echo "🌐 Opening frontend..."
    open http://localhost:8080 || xdg-open http://localhost:8080 || echo "Please open http://localhost:8080 in your browser"

# Check code style issues
check:
    @echo "🔍 Checking for issues..."
    @echo "Python imports:"
    -docker-compose -f docker-compose.dev.yml exec backend isort . --check-only --diff
    @echo "\nPython formatting:"
    -docker-compose -f docker-compose.dev.yml exec backend black . --check
    @echo "\nTypeScript/React:"
    docker-compose -f docker-compose.dev.yml exec frontend npm run lint

# Run a one-off command in a service
run service *cmd:
    docker-compose -f docker-compose.dev.yml run --rm {{service}} {{cmd}}

# Backup database
backup-db:
    @echo "💾 Backing up database..."
    @mkdir -p backups
    docker-compose -f docker-compose.dev.yml exec -T db pg_dump -U postgres mishmob_db > backups/mishmob_$(date +%Y%m%d_%H%M%S).sql
    @echo "✅ Database backed up to backups/"

# Restore database from backup
restore-db file:
    @echo "📥 Restoring database from {{file}}..."
    docker-compose -f docker-compose.dev.yml exec -T db psql -U postgres -d mishmob_db < {{file}}
    @echo "✅ Database restored!"

# Show environment info
info:
    @echo "MishMob Development Environment"
    @echo "==============================="
    @echo "Frontend URL: http://localhost:8080"
    @echo "Backend URL:  http://localhost:9000"
    @echo "API URL:      http://localhost:9000/api"
    @echo "Admin URL:    http://localhost:9000/admin"
    @echo "Database:     PostgreSQL on port 5433"
    @echo ""
    @echo "Service Status:"
    @docker-compose -f docker-compose.dev.yml ps