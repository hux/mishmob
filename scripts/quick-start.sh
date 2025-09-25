#!/bin/bash

# MishMob Quick Start Script
# Starts all services for development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_warning "Docker is not running. Starting Docker Desktop..."
    open -a Docker
    print_step "Waiting for Docker to start..."
    while ! docker info &> /dev/null; do
        sleep 2
    done
    print_success "Docker is running"
fi

# Start backend services
print_step "Starting backend services..."
docker-compose up -d db redis search

# Wait for database
print_step "Waiting for database to be ready..."
until docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done
print_success "Database is ready"

# Start backend API
print_step "Starting backend API..."
docker-compose up -d backend

# Run migrations if needed
print_step "Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Create superuser if it doesn't exist
print_step "Checking for superuser..."
docker-compose exec -T backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mishmob.local', 'admin123')
    print("Superuser created: admin/admin123")
else:
    print("Superuser already exists")
EOF

# Start web frontend
print_step "Starting web frontend..."
docker-compose up -d web

# Mobile app instructions
echo ""
echo -e "${GREEN}🚀 Backend services are running!${NC}"
echo ""
echo "Access points:"
echo "  📱 Web App: http://localhost:5175"
echo "  📚 API Docs: http://localhost:8001/api/docs"
echo "  🔧 Django Admin: http://localhost:8001/admin (admin/admin123)"
echo "  🔍 Meilisearch: http://localhost:7701"
echo ""
echo "To start the mobile app:"
echo "  iOS:     cd mobile && npx expo start --ios"
echo "  Android: cd mobile && npx expo start --android"
echo "  Expo Go: cd mobile && npx expo start"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  docker-compose down"