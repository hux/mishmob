# MishMob Production Kubernetes Deployment

This directory contains Kubernetes manifests for deploying MishMob to production using Kustomize.

## Prerequisites

1. **Docker Images**: Build and push production Docker images
2. **Kubernetes Cluster**: Access to a K8s cluster (EKS, GKE, AKS, or local)
3. **kubectl**: Kubernetes CLI tool
4. **kustomize**: For managing K8s configurations

## Directory Structure

```
k8s/
├── base/                    # Base configurations
│   ├── namespace.yaml      # Namespace definition
│   ├── secrets.yaml        # Secret templates (DO NOT commit real values)
│   ├── *-deployment.yaml   # Service deployments
│   ├── ingress.yaml        # Ingress configuration
│   └── kustomization.yaml  # Kustomize base config
└── overlays/               # Environment-specific overrides
    └── prod/              # Production environment
```

## Building Docker Images

```bash
# Build backend image
cd backend/
docker build -t mishmob/backend:latest -f Dockerfile .
docker tag mishmob/backend:latest your-registry/mishmob/backend:v1.0.0
docker push your-registry/mishmob/backend:v1.0.0

# Build frontend image
cd frontend/
docker build -t mishmob/frontend:latest -f Dockerfile .
docker tag mishmob/frontend:latest your-registry/mishmob/frontend:v1.0.0
docker push your-registry/mishmob/frontend:v1.0.0
```

## Deployment

### 1. Create Production Secrets

```bash
# Use the interactive secret creation
make create-secrets

# Or manually create secrets
kubectl create namespace mishmob-prod

kubectl create secret generic backend-secrets \
  --from-literal=secret-key='your-django-secret-key' \
  -n mishmob-prod

kubectl create secret generic postgres-secrets \
  --from-literal=username='postgres' \
  --from-literal=password='your-secure-password' \
  -n mishmob-prod

kubectl create secret generic meilisearch-secrets \
  --from-literal=master-key='your-32-character-master-key' \
  -n mishmob-prod
```

### 2. Build and Push Images

```bash
# Build and push to ECR (uses default registry from Makefile)
make build

# Or specify a different registry
make build ECR_REGISTRY=your-registry.dkr.ecr.region.amazonaws.com
```

### 3. Deploy to Production

```bash
# Deploy using Make (recommended)
make deploy

# Or use the deployment script directly
./scripts/deploy-production.sh

# Quick deploy (build and deploy)
make quick-deploy
```

### 4. Check Deployment Status

```bash
# Use Make commands
make status
make logs
make logs service=frontend

# Or kubectl directly
kubectl get pods -n mishmob-prod
kubectl get services -n mishmob-prod
kubectl get ingress -n mishmob-prod
kubectl logs -f deployment/backend-prod -n mishmob-prod
```

## Database Management

```bash
# Run migrations
make db-migrate

# Get database shell
make db-shell

# Create database backup
make db-backup

# Create superuser manually
kubectl exec -it deployment/backend-prod -n mishmob-prod -- python manage.py createsuperuser
```

## Scaling and Management

```bash
# Scale services
make scale service=backend replicas=3
make scale service=frontend replicas=3

# Restart services
make restart
make restart service=frontend

# Rollback deployment
make rollback
```

## Updating Deployments

```bash
# Build and deploy new version
make build IMAGE_TAG=v1.0.1
make deploy IMAGE_TAG=v1.0.1

# Or in one command
make quick-deploy IMAGE_TAG=v1.0.1
```

## Troubleshooting

```bash
# Check if secrets exist
make check-secrets

# Describe pod for events
kubectl describe pod <pod-name> -n mishmob-prod

# Get pod logs
kubectl logs <pod-name> -n mishmob-prod

# Execute commands in pod
kubectl exec -it <pod-name> -n mishmob-prod -- /bin/bash

# Check persistent volumes
kubectl get pv
kubectl get pvc -n mishmob-prod
```

## Security Notes

1. **Never commit real secrets** to version control
2. Use **Sealed Secrets** or **External Secrets Operator** for GitOps
3. Enable **RBAC** and use **Service Accounts** properly
4. Use **Network Policies** to restrict traffic between pods
5. Enable **Pod Security Standards**

## Production Considerations

1. **High Availability**: 
   - Use multiple replicas for stateless services
   - Consider PostgreSQL HA solutions (e.g., Patroni, CloudNativePG)
   - Use Redis Sentinel or Redis Cluster for HA

2. **Monitoring**:
   - Deploy Prometheus and Grafana
   - Set up alerts for pod restarts, resource usage
   - Use application performance monitoring (APM)

3. **Backup**:
   - Regular PostgreSQL backups
   - Volume snapshots for persistent data
   - Test restore procedures

4. **Resource Management**:
   - Set appropriate resource requests and limits
   - Use Horizontal Pod Autoscaler (HPA)
   - Monitor and adjust based on usage

5. **Ingress Controller**:
   - Install NGINX Ingress Controller
   - Use cert-manager for TLS certificates
   - Configure rate limiting and WAF rules