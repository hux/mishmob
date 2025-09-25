#!/bin/bash
set -e

# Import public images to ECR
ECR_REGISTRY="${ECR_REGISTRY:-787643543720.dkr.ecr.us-east-1.amazonaws.com}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Function to create ECR repo if doesn't exist
create_ecr_repo() {
    local repo_name=$1
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

# Function to import image
import_image() {
    local source_image=$1
    local ecr_repo=$2
    local tag=${3:-latest}
    
    log_info "Pulling $source_image..."
    # Try to pull without login first, if it fails, skip
    if ! docker pull $source_image 2>/dev/null; then
        log_warning "Failed to pull $source_image from Docker Hub."
        log_warning "This might be due to rate limits or authentication requirements."
        log_warning "You can manually pull the image with: docker pull $source_image"
        log_warning "Or use a Docker Hub account: docker login"
        echo ""
        
        # Try alternative registries
        local alt_source=""
        case "$source_image" in
            "postgres:16-alpine")
                alt_source="public.ecr.aws/docker/library/postgres:16-alpine"
                ;;
            "redis:7-alpine")
                alt_source="public.ecr.aws/docker/library/redis:7-alpine"
                ;;
            "nginx:alpine")
                alt_source="public.ecr.aws/docker/library/nginx:alpine"
                ;;
        esac
        
        if [ ! -z "$alt_source" ]; then
            log_info "Trying alternative source: $alt_source"
            if docker pull $alt_source 2>/dev/null; then
                docker tag $alt_source $source_image
            else
                return 1
            fi
        else
            return 1
        fi
    fi
    
    local ecr_url="$ECR_REGISTRY/$ecr_repo:$tag"
    log_info "Tagging as $ecr_url..."
    docker tag $source_image $ecr_url
    
    log_info "Pushing to ECR..."
    docker push $ecr_url
    
    log_info "Successfully imported $source_image to $ecr_url"
    echo ""
}

# Create repositories and import images
log_info "Starting image import process..."

# PostgreSQL
create_ecr_repo "mishmob/postgres"
import_image "postgres:16-alpine" "mishmob/postgres" "16-alpine"

# Redis
create_ecr_repo "mishmob/redis"
import_image "redis:7-alpine" "mishmob/redis" "7-alpine"

# Meilisearch
create_ecr_repo "mishmob/meilisearch"
import_image "getmeili/meilisearch:v1.11" "mishmob/meilisearch" "v1.11"

# Nginx (for frontend if using nginx image)
create_ecr_repo "mishmob/nginx"
import_image "nginx:alpine" "mishmob/nginx" "alpine"

# Summary
log_info "Image import complete!"
echo ""
echo "Images now available in ECR:"
echo "  - $ECR_REGISTRY/mishmob/postgres:16-alpine"
echo "  - $ECR_REGISTRY/mishmob/redis:7-alpine"
echo "  - $ECR_REGISTRY/mishmob/meilisearch:v1.11"
echo "  - $ECR_REGISTRY/mishmob/nginx:alpine"
echo ""
echo "Next step: Update your k8s manifests to use these ECR URLs"