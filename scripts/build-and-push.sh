#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REGISTRY="${ECR_REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"
SINGLE_PLATFORM="${SINGLE_PLATFORM:-false}"

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if ECR_REGISTRY is set
if [ -z "$ECR_REGISTRY" ]; then
    log_error "ECR_REGISTRY environment variable is not set"
    echo "Usage: ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./build-and-push.sh"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install it first."
    exit 1
fi

# Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repositories if they don't exist
create_ecr_repo() {
    local repo_name=$1
    log_info "Checking if ECR repository $repo_name exists..."
    
    if ! aws ecr describe-repositories --repository-names "$repo_name" --region $AWS_REGION &> /dev/null; then
        log_info "Creating ECR repository: $repo_name"
        aws ecr create-repository \
            --repository-name "$repo_name" \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true \
            --image-tag-mutability MUTABLE
    else
        log_info "Repository $repo_name already exists"
    fi
}

# Create repositories
create_ecr_repo "mishmob/backend"
create_ecr_repo "mishmob/frontend"

# Function to build and push image
build_and_push() {
    local service=$1
    local dockerfile=$2
    local context=$3
    
    log_info "Building $service image..."
    
    # Build for multiple platforms if buildx is available and not in single platform mode
    if docker buildx version &> /dev/null && [ "$SINGLE_PLATFORM" != "true" ]; then
        log_info "Using Docker Buildx for multi-platform build"
        
        # Create buildx builder if it doesn't exist
        if ! docker buildx ls | grep -q mishmob-builder; then
            docker buildx create --name mishmob-builder --use
        else
            docker buildx use mishmob-builder
        fi
        
        # Try multi-platform build first
        if docker buildx build \
            --platform $PLATFORMS \
            --tag $ECR_REGISTRY/mishmob/$service:$IMAGE_TAG \
            --tag $ECR_REGISTRY/mishmob/$service:latest \
            --file $dockerfile \
            --push \
            $context 2>/tmp/buildx-error.log; then
            log_info "Multi-platform build successful"
        else
            log_warning "Multi-platform build failed, falling back to single platform"
            cat /tmp/buildx-error.log
            
            # Fallback to single platform build
            docker buildx build \
                --tag $ECR_REGISTRY/mishmob/$service:$IMAGE_TAG \
                --tag $ECR_REGISTRY/mishmob/$service:latest \
                --file $dockerfile \
                --push \
                $context
        fi
    else
        log_warning "Docker Buildx not available, building for current platform only"
        
        docker build \
            --tag $ECR_REGISTRY/mishmob/$service:$IMAGE_TAG \
            --tag $ECR_REGISTRY/mishmob/$service:latest \
            --file $dockerfile \
            $context
        
        log_info "Pushing $service image..."
        docker push $ECR_REGISTRY/mishmob/$service:$IMAGE_TAG
        docker push $ECR_REGISTRY/mishmob/$service:latest
    fi
    
    log_info "Successfully built and pushed $service"
}

# Get git commit hash for tagging
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
if [ "$IMAGE_TAG" == "latest" ] && [ "$GIT_COMMIT" != "no-git" ]; then
    IMAGE_TAG=$GIT_COMMIT
    log_info "Using git commit hash as image tag: $IMAGE_TAG"
fi

# Build and push images
log_info "Starting build process..."

# Backend
build_and_push "backend" "./backend/Dockerfile" "./backend"

# Frontend
build_and_push "frontend" "./frontend/Dockerfile" "./frontend"

# Summary
log_info "Build and push complete!"
echo ""
echo "Images pushed:"
echo "  - $ECR_REGISTRY/mishmob/backend:$IMAGE_TAG"
echo "  - $ECR_REGISTRY/mishmob/backend:latest"
echo "  - $ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG"
echo "  - $ECR_REGISTRY/mishmob/frontend:latest"
echo ""
echo "To deploy to Kubernetes, update your manifests with:"
echo "  image: $ECR_REGISTRY/mishmob/backend:$IMAGE_TAG"
echo "  image: $ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG"