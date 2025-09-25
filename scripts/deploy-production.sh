#!/bin/bash
set -e

# Production deployment script for MishMob
ECR_REGISTRY="${ECR_REGISTRY:-787643543720.dkr.ecr.us-east-1.amazonaws.com}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="mishmob"

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

# Safety confirmation for production
echo -e "${YELLOW}WARNING: You are about to deploy to PRODUCTION!${NC}"
echo "ECR Registry: $ECR_REGISTRY"
echo "Image Tag: $IMAGE_TAG"
echo "Namespace: $NAMESPACE"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to confirm: " -r
if [[ ! $REPLY == "yes" ]]; then
    log_info "Deployment cancelled."
    exit 0
fi

log_info "Starting production deployment..."

# Create namespace if it doesn't exist
log_info "Creating namespace $NAMESPACE if it doesn't exist..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Check and create required secrets
log_info "Checking for required secrets..."
if ! kubectl get secret backend-secrets -n $NAMESPACE &> /dev/null; then
    log_error "Secret 'backend-secrets' not found in $NAMESPACE"
    log_error "Please create production secrets before deploying:"
    echo "  kubectl create secret generic backend-secrets \\"
    echo "    --from-literal=secret-key='your-production-secret-key' \\"
    echo "    -n $NAMESPACE"
    exit 1
fi

if ! kubectl get secret postgres-secrets -n $NAMESPACE &> /dev/null; then
    log_error "Secret 'postgres-secrets' not found in $NAMESPACE"
    log_error "Please create production secrets before deploying:"
    echo "  kubectl create secret generic postgres-secrets \\"
    echo "    --from-literal=username='postgres' \\"
    echo "    --from-literal=password='your-secure-password' \\"
    echo "    -n $NAMESPACE"
    exit 1
fi

if ! kubectl get secret meilisearch-secrets -n $NAMESPACE &> /dev/null; then
    log_error "Secret 'meilisearch-secrets' not found in $NAMESPACE"
    log_error "Please create production secrets before deploying:"
    echo "  kubectl create secret generic meilisearch-secrets \\"
    echo "    --from-literal=master-key='your-32-character-master-key' \\"
    echo "    -n $NAMESPACE"
    exit 1
fi

# Update kustomization with ECR images
log_info "Updating kustomization with ECR images..."
cat > infra/k8s/overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

images:
  - name: mishmob/backend:latest
    newName: $ECR_REGISTRY/mishmob/backend
    newTag: $IMAGE_TAG
  - name: mishmob/frontend:latest
    newName: $ECR_REGISTRY/mishmob/frontend
    newTag: $IMAGE_TAG

replicas:
  - name: web-backend
    count: 2
  - name: web-ui
    count: 2

patches:
  - target:
      kind: Ingress
      name: mishmob-ingress
    patch: |-
      - op: replace
        path: /spec/tls/0/hosts/0
        value: mishmob.com
      - op: replace
        path: /spec/tls/0/hosts/1
        value: api.mishmob.com
      - op: replace
        path: /spec/rules/0/host
        value: mishmob.com
      - op: replace
        path: /spec/rules/1/host
        value: api.mishmob.com
EOF

# Deploy with kustomize
log_info "Applying Kubernetes manifests..."
kubectl apply -k infra/k8s/overlays/prod/

# Wait for deployments
log_info "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s \
    deployment/web-backend \
    deployment/web-ui \
    -n $NAMESPACE || log_warning "Some deployments are taking longer than expected"

# Run database migrations
log_info "Running database migrations..."
kubectl exec -n $NAMESPACE deployment/web-backend -- python manage.py migrate || log_warning "Migration failed or already applied"

# Show deployment status
log_info "Deployment status:"
echo ""
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE

# Show application URLs
echo ""
log_info "Application URLs:"
echo "  - Frontend: https://mishmob.com"
echo "  - API: https://api.mishmob.com"
echo ""
log_info "Production deployment complete!"

# Show monitoring commands
echo ""
log_info "Useful commands:"
echo "  # View logs"
echo "  kubectl logs -f deployment/web-backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/web-ui -n $NAMESPACE"
echo ""
echo "  # Scale deployments"
echo "  kubectl scale deployment/web-backend --replicas=3 -n $NAMESPACE"
echo "  kubectl scale deployment/web-ui --replicas=3 -n $NAMESPACE"
echo ""
echo "  # Check pod details"
echo "  kubectl describe pod -n $NAMESPACE"