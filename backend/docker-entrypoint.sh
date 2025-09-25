#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
echo "DATABASE_HOST=$DATABASE_HOST"
echo "DATABASE_PORT=$DATABASE_PORT"
while ! pg_isready -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it does not exist
echo "Creating superuser..."
python create_superuser.py || echo "Superuser creation skipped"

# Start development server with hot-reloading
echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000