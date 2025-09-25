#!/bin/bash
set -e

# Quick deployment without PVCs (data is ephemeral)
ECR_REGISTRY="${ECR_REGISTRY:-787643543720.dkr.ecr.us-east-1.amazonaws.com}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="mishmob"

echo "Quick deployment (without persistent storage)"
echo "WARNING: Database data will be lost if pods restart!"
echo ""

# Create namespace
echo "Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy using kustomize overlay which has the correct ECR images
echo "Deploying with kustomize..."
kubectl apply -k infra/k8s/overlays/prod/

# Wait a moment for resources to be created
sleep 2

# Delete the StatefulSets and PVCs that will fail
echo "Removing StatefulSets that require PVCs..."
kubectl delete statefulset postgres meilisearch -n $NAMESPACE --ignore-not-found=true
kubectl delete pvc --all -n $NAMESPACE --ignore-not-found=true

# Apply the ephemeral storage deployments
echo "Creating deployments with ephemeral storage..."
kubectl apply -f infra/k8s/overlays/prod/postgres-no-pvc.yaml -n $NAMESPACE
kubectl apply -f infra/k8s/overlays/prod/meilisearch-no-pvc.yaml -n $NAMESPACE

# Patch Redis to use emptyDir instead of PVC
echo "Patching Redis to use ephemeral storage..."
kubectl patch deployment redis -n $NAMESPACE --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/volumes",
    "value": [
      {
        "name": "redis-storage",
        "emptyDir": {}
      }
    ]
  }
]'

echo ""
echo "Deployment started. Checking status..."
kubectl get pods -n $NAMESPACE

echo ""
echo "Note: This deployment uses emptyDir volumes."
echo "For production with persistent storage:"
echo "1. Install AWS EBS CSI driver"
echo "2. Use 'make deploy' for proper PVC-backed storage"