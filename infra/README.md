# MishMob Infrastructure

This directory contains infrastructure as code and deployment configurations for MishMob.

## Structure

```
infra/
├── kubernetes/        # Kubernetes manifests
│   ├── base/         # Base configurations
│   ├── overlays/     # Environment-specific configs
│   └── scripts/      # Deployment scripts
├── helm/             # Helm charts
│   ├── mishmob/      # Main application chart
│   └── values/       # Environment values
└── terraform/        # Infrastructure provisioning
    ├── aws/          # AWS infrastructure
    ├── gcp/          # GCP infrastructure
    └── modules/      # Reusable modules
```

## Kubernetes

### Local Development with Minikube

```bash
minikube start
kubectl apply -k kubernetes/overlays/development
```

### Production Deployment

```bash
kubectl apply -k kubernetes/overlays/production
```

## Helm Charts

### Install

```bash
helm install mishmob ./helm/mishmob \
  -f ./helm/values/production.yaml \
  --namespace mishmob \
  --create-namespace
```

### Upgrade

```bash
helm upgrade mishmob ./helm/mishmob \
  -f ./helm/values/production.yaml \
  --namespace mishmob
```

## Terraform

### AWS Deployment

```bash
cd terraform/aws
terraform init
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"
```

## Microservices Architecture

The platform is designed to scale with additional microservices:

- **mishmob-api**: Main Django backend (current)
- **mishmob-frontend**: React frontend (current)
- **mishmob-matching**: Skills matching service (planned)
- **mishmob-notifications**: Email/SMS service (planned)
- **mishmob-analytics**: Analytics service (planned)
- **mishmob-search**: Elasticsearch service (planned)

## CI/CD Pipeline

GitHub Actions workflows for:
- Building Docker images
- Running tests
- Deploying to Kubernetes
- Infrastructure updates

## Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **ELK Stack**: Log aggregation
- **Jaeger**: Distributed tracing