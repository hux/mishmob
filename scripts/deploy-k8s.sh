#!/bin/bash
set -e

# Configuration
ENVIRONMENT="${1:-dev}"
ECR_REGISTRY="${ECR_REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="mishmob-${ENVIRONMENT}"

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

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed. Please install it first."
    exit 1
fi

# Check environment argument
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: ./deploy-k8s.sh [dev|staging|prod]"
    exit 1
fi

# Check if ECR_REGISTRY is set for non-local deployments
if [ -z "$ECR_REGISTRY" ] && [ "$ENVIRONMENT" != "dev" ]; then
    log_error "ECR_REGISTRY environment variable is not set"
    echo "Usage: ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./deploy-k8s.sh $ENVIRONMENT"
    exit 1
fi

log_info "Deploying to $ENVIRONMENT environment..."

# Create namespace if it doesn't exist
log_info "Creating namespace $NAMESPACE if it doesn't exist..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets if they don't exist
log_info "Checking for required secrets..."
if ! kubectl get secret backend-secrets -n $NAMESPACE &> /dev/null; then
    log_warning "Secret 'backend-secrets' not found. Creating with default values..."
    kubectl create secret generic backend-secrets \
        --from-literal=secret-key='dev-secret-key-change-in-production' \
        -n $NAMESPACE
fi

if ! kubectl get secret postgres-secrets -n $NAMESPACE &> /dev/null; then
    log_warning "Secret 'postgres-secrets' not found. Creating with default values..."
    kubectl create secret generic postgres-secrets \
        --from-literal=username='postgres' \
        --from-literal=password='postgres-dev-password' \
        -n $NAMESPACE
fi

if ! kubectl get secret meilisearch-secrets -n $NAMESPACE &> /dev/null; then
    log_warning "Secret 'meilisearch-secrets' not found. Creating with default values..."
    kubectl create secret generic meilisearch-secrets \
        --from-literal=master-key='dev-meilisearch-master-key-32-chars-minimum' \
        -n $NAMESPACE
fi

# Deploy with kustomize
log_info "Applying Kubernetes manifests..."

# Update kustomization file with ECR images if registry is set
if [ ! -z "$ECR_REGISTRY" ]; then
    log_info "Updating image references for ECR deployment..."
    ./scripts/update-k8s-images.sh $ENVIRONMENT
fi

# Apply the manifests
kubectl apply -k infra/k8s/overlays/$ENVIRONMENT/

# Wait for deployments
log_info "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s \
    deployment/backend-$ENVIRONMENT \
    deployment/frontend-$ENVIRONMENT \
    -n $NAMESPACE

# Run database migrations
log_info "Running database migrations..."
kubectl exec -n $NAMESPACE deployment/backend-$ENVIRONMENT -- python manage.py migrate || log_warning "Migration failed or already applied"

# Show deployment status
log_info "Deployment complete! Current status:"
echo ""
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE

# Get ingress URL
INGRESS_HOST=$(kubectl get ingress mishmob-ingress-$ENVIRONMENT -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "No ingress found")
if [ "$INGRESS_HOST" != "No ingress found" ]; then
    echo ""
    log_info "Application should be accessible at:"
    echo "  - Frontend: https://$INGRESS_HOST"
    echo "  - API: https://api-$ENVIRONMENT.mishmob.example.com"
fi

# Show logs command
echo ""
log_info "To view logs:"
echo "  kubectl logs -f deployment/backend-$ENVIRONMENT -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend-$ENVIRONMENT -n $NAMESPACE"