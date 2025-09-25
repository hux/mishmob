#!/bin/bash
set -e

# Configuration
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install it first."
    exit 1
fi

# Get git commit hash for tagging
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
if [ "$IMAGE_TAG" == "latest" ] && [ "$GIT_COMMIT" != "no-git" ]; then
    IMAGE_TAG=$GIT_COMMIT
    log_info "Using git commit hash as image tag: $IMAGE_TAG"
fi

# Build images locally
log_info "Building backend image..."
docker build \
    --tag mishmob/backend:$IMAGE_TAG \
    --tag mishmob/backend:latest \
    --file ./backend/Dockerfile \
    ./backend

log_info "Building frontend image..."
docker build \
    --tag mishmob/frontend:$IMAGE_TAG \
    --tag mishmob/frontend:latest \
    --file ./frontend/Dockerfile \
    ./frontend

# Summary
log_info "Build complete!"
echo ""
echo "Images built:"
echo "  - mishmob/backend:$IMAGE_TAG"
echo "  - mishmob/backend:latest"
echo "  - mishmob/frontend:$IMAGE_TAG"
echo "  - mishmob/frontend:latest"
echo ""
echo "To test locally with docker-compose:"
echo "  docker-compose -f docker-compose.prod.yml up"