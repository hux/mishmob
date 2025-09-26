#!/bin/bash
set -e

# Force update script for MishMob deployments
NAMESPACE="mishmob"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Forcing update of MishMob deployments...${NC}"
echo ""

# First apply the latest k8s configurations
echo -e "${GREEN}[INFO]${NC} Applying latest k8s configurations..."
kubectl apply -k infra/k8s/overlays/prod/

# Force pods to restart and pull latest images
echo -e "${GREEN}[INFO]${NC} Forcing rollout restart of deployments..."
kubectl rollout restart deployment/web-backend -n $NAMESPACE
kubectl rollout restart deployment/web-ui -n $NAMESPACE

# Wait for rollouts to complete
echo -e "${GREEN}[INFO]${NC} Waiting for rollouts to complete..."
kubectl rollout status deployment/web-backend -n $NAMESPACE
kubectl rollout status deployment/web-ui -n $NAMESPACE

# Show status
echo ""
echo -e "${GREEN}[INFO]${NC} Current deployment status:"
kubectl get pods -n $NAMESPACE
echo ""
echo -e "${GREEN}[INFO]${NC} Force update complete!"