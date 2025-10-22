# Production Dockerfile for Django backend
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    cargo \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn

# Copy project files
COPY . /app/

# Set dummy environment variables for collectstatic during build
ENV SECRET_KEY="dummy-secret-key-for-build" \
    DATABASE_NAME="dummy" \
    DATABASE_USER="dummy" \
    DATABASE_PASSWORD="dummy" \
    DATABASE_HOST="dummy" \
    DATABASE_PORT="5432"

# Create staticfiles directory and collect static files as root
RUN mkdir -p /app/staticfiles && \
    python manage.py collectstatic --noinput || echo "Collectstatic failed, continuing..."

# Create non-root user and change ownership
RUN useradd -m -u 1000 django && \
    chown -R django:django /app

# Switch to non-root user
USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120", "mishmob.wsgi:application"]