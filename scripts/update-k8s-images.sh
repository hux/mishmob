#!/bin/bash
set -e

# Configuration
ENVIRONMENT="${1:-dev}"
ECR_REGISTRY="${ECR_REGISTRY}"
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

# Check environment argument
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: ./update-k8s-images.sh [dev|staging|prod]"
    exit 1
fi

# Check if ECR_REGISTRY is set
if [ -z "$ECR_REGISTRY" ]; then
    log_error "ECR_REGISTRY environment variable is not set"
    echo "Usage: ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./update-k8s-images.sh $ENVIRONMENT"
    exit 1
fi

log_info "Updating image references for $ENVIRONMENT environment..."

# Create or update kustomization.yaml with image references
KUSTOMIZATION_FILE="infra/k8s/overlays/$ENVIRONMENT/kustomization.yaml"

# Create directory if it doesn't exist
mkdir -p "infra/k8s/overlays/$ENVIRONMENT"

# Create kustomization file with ECR image references
cat > "$KUSTOMIZATION_FILE" <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: mishmob-$ENVIRONMENT

bases:
  - ../../base

nameSuffix: -$ENVIRONMENT

images:
  - name: mishmob/backend:latest
    newName: $ECR_REGISTRY/mishmob/backend
    newTag: $IMAGE_TAG
  - name: mishmob/frontend:latest
    newName: $ECR_REGISTRY/mishmob/frontend
    newTag: $IMAGE_TAG

replicas:
  - name: backend
    count: $([ "$ENVIRONMENT" == "prod" ] && echo "2" || echo "1")
  - name: frontend
    count: $([ "$ENVIRONMENT" == "prod" ] && echo "2" || echo "1")
EOF

# Add environment-specific patches
if [ "$ENVIRONMENT" == "dev" ]; then
    cat >> "$KUSTOMIZATION_FILE" <<'EOF'

patches:
  - target:
      kind: Deployment
      name: backend
    patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/env/0/value
        value: "True"  # DEBUG=True for dev
  - target:
      kind: Ingress
      name: mishmob-ingress
    patch: |-
      - op: replace
        path: /spec/tls/0/hosts/0
        value: dev.mishmob.example.com
      - op: replace
        path: /spec/tls/0/hosts/1
        value: api-dev.mishmob.example.com
      - op: replace
        path: /spec/rules/0/host
        value: dev.mishmob.example.com
      - op: replace
        path: /spec/rules/1/host
        value: api-dev.mishmob.example.com
EOF
fi

log_info "Updated $KUSTOMIZATION_FILE with ECR images"
echo ""
echo "Image configuration:"
echo "  Backend: $ECR_REGISTRY/mishmob/backend:$IMAGE_TAG"
echo "  Frontend: $ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG"
echo ""
echo "To deploy, run:"
echo "  kubectl apply -k infra/k8s/overlays/$ENVIRONMENT/"