# Build and Deployment Scripts

This directory contains scripts for building Docker images and deploying to Kubernetes.

## Scripts

### build-and-push.sh
Builds Docker images and pushes them to Amazon ECR.

**Usage:**
```bash
ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./scripts/build-and-push.sh
```

**Options:**
- `ECR_REGISTRY`: Your ECR registry URL (required)
- `IMAGE_TAG`: Docker image tag (default: git commit hash or 'latest')
- `AWS_REGION`: AWS region (default: us-east-1)
- `PLATFORMS`: Target platforms (default: linux/amd64,linux/arm64)
- `SINGLE_PLATFORM`: Set to 'true' to build for current platform only

**Examples:**
```bash
# Multi-platform build (default)
ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./scripts/build-and-push.sh

# Single platform build (faster, if multi-platform fails)
SINGLE_PLATFORM=true ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./scripts/build-and-push.sh

# Custom tag
IMAGE_TAG=v1.2.3 ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./scripts/build-and-push.sh

# Build for AMD64 only
PLATFORMS=linux/amd64 ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./scripts/build-and-push.sh
```

### build-local.sh
Builds Docker images locally for testing.

**Usage:**
```bash
./scripts/build-local.sh
```

### deploy-k8s.sh
Deploys the application to Kubernetes.

**Usage:**
```bash
./scripts/deploy-k8s.sh [environment]
```

**Environments:**
- `dev`: Development environment
- `staging`: Staging environment
- `prod`: Production environment

## Troubleshooting

### Multi-platform build fails

If you encounter errors like "Cannot find module @rollup/rollup-linux-arm64-musl", try:

1. Use single platform mode:
   ```bash
   SINGLE_PLATFORM=true ECR_REGISTRY=... ./scripts/build-and-push.sh
   ```

2. Use the alternative Dockerfile:
   ```bash
   # Edit build-and-push.sh to use Dockerfile.multiplatform for frontend
   ```

3. Build for your current platform only:
   ```bash
   PLATFORMS=$(docker system info --format '{{.OSType}}/{{.Architecture}}') ECR_REGISTRY=... ./scripts/build-and-push.sh
   ```

### ECR login fails

Ensure you have AWS CLI configured:
```bash
aws configure
aws ecr get-login-password --region us-east-1
```

### Build runs out of memory

For Docker Desktop, increase memory allocation in settings.

For buildx, you can limit parallelism:
```bash
docker buildx create --name mishmob-builder --driver-opt env.BUILDKIT_STEP_LOG_MAX_SIZE=10000000 --driver-opt env.BUILDKIT_STEP_LOG_MAX_SPEED=10000000
```

## Best Practices

1. **Always tag production images** with version numbers, not 'latest'
2. **Test locally first** using `build-local.sh`
3. **Use multi-platform builds** for production to support both Intel and ARM instances
4. **Monitor build logs** for security vulnerabilities reported by npm audit
5. **Clean up old images** regularly from ECR to save costs

## CI/CD Integration

For GitHub Actions, GitLab CI, or other CI/CD systems:

```yaml
# Example GitHub Actions step
- name: Build and push to ECR
  env:
    ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
  run: |
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
    ./scripts/build-and-push.sh
```