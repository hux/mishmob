#!/bin/bash
set -e

# Quick script to fix image references in a running Kubernetes deployment

ECR_REGISTRY="${ECR_REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="${NAMESPACE:-mishmob-dev}"

if [ -z "$ECR_REGISTRY" ]; then
    echo "ERROR: ECR_REGISTRY is required"
    echo "Usage: ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./fix-k8s-images.sh"
    exit 1
fi

echo "Updating deployments in namespace $NAMESPACE to use ECR images..."

# Update backend deployment
kubectl set image deployment/backend backend=$ECR_REGISTRY/mishmob/backend:$IMAGE_TAG -n $NAMESPACE || \
kubectl set image deployment/backend-dev backend=$ECR_REGISTRY/mishmob/backend:$IMAGE_TAG -n $NAMESPACE || \
echo "Backend deployment not found"

# Update frontend deployment
kubectl set image deployment/frontend frontend=$ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG -n $NAMESPACE || \
kubectl set image deployment/frontend-dev frontend=$ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG -n $NAMESPACE || \
echo "Frontend deployment not found"

echo ""
echo "Updated images to:"
echo "  Backend: $ECR_REGISTRY/mishmob/backend:$IMAGE_TAG"
echo "  Frontend: $ECR_REGISTRY/mishmob/frontend:$IMAGE_TAG"
echo ""
echo "Checking deployment status..."
kubectl get deployments -n $NAMESPACE
echo ""
kubectl get pods -n $NAMESPACE