.PHONY: help build build-local push deploy clean status logs

# Default ECR registry
ECR_REGISTRY ?= 787643543720.dkr.ecr.us-east-1.amazonaws.com
IMAGE_TAG ?= latest

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
dev: ## Start local development environment with docker-compose
	docker-compose up -d

dev-down: ## Stop local development environment
	docker-compose down

dev-logs: ## Show development logs
	docker-compose logs -f

dev-build: ## Rebuild development containers
	docker-compose build

# Production builds
build-local: ## Build Docker images locally
	./scripts/build-local.sh

build: ## Build and push Docker images to ECR
	ECR_REGISTRY=$(ECR_REGISTRY) IMAGE_TAG=$(IMAGE_TAG) ./scripts/build-and-push.sh

push: build ## Alias for build (builds and pushes to ECR)

import-images: ## Import public Docker images to ECR
	ECR_REGISTRY=$(ECR_REGISTRY) ./scripts/import-images-to-ecr.sh

# Production deployment
deploy: ## Deploy to production Kubernetes
	@echo "Deploying to production with:"
	@echo "  Registry: $(ECR_REGISTRY)"
	@echo "  Tag: $(IMAGE_TAG)"
	@echo ""
	ECR_REGISTRY=$(ECR_REGISTRY) IMAGE_TAG=$(IMAGE_TAG) ./scripts/deploy-production.sh

# Production management
status: ## Show production deployment status
	@echo "=== Production Pods ==="
	kubectl get pods -n mishmob
	@echo ""
	@echo "=== Production Services ==="
	kubectl get svc -n mishmob
	@echo ""
	@echo "=== Production Ingress ==="
	kubectl get ingress -n mishmob

logs: ## Show production logs (use with service=backend or service=ui)
	kubectl logs -f deployment/web-$(or $(service),backend) -n mishmob

scale: ## Scale production deployment (use with service=backend replicas=3)
	kubectl scale deployment/web-$(service) --replicas=$(replicas) -n mishmob

restart: ## Restart production pods (use with service=backend or service=ui)
	kubectl rollout restart deployment/web-$(or $(service),backend) -n mishmob

# Database management
db-shell: ## Get a shell to production database
	kubectl exec -it statefulset/postgres -n mishmob -- psql -U postgres -d mishmob_db

db-migrate: ## Run database migrations in production
	kubectl exec deployment/web-backend -n mishmob -- python manage.py migrate

db-backup: ## Create a database backup
	@echo "Creating database backup..."
	kubectl exec statefulset/postgres -n mishmob -- pg_dump -U postgres mishmob_db > backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup saved to backup-$$(date +%Y%m%d-%H%M%S).sql"

# Utilities
clean: ## Clean up local Docker images
	docker rmi mishmob/backend:latest mishmob/frontend:latest || true
	docker rmi $(ECR_REGISTRY)/mishmob/backend:latest $(ECR_REGISTRY)/mishmob/frontend:latest || true

check-secrets: ## Check if production secrets are configured
	@echo "Checking production secrets..."
	@kubectl get secret backend-secrets -n mishmob &>/dev/null && echo "✓ backend-secrets" || echo "✗ backend-secrets (missing)"
	@kubectl get secret postgres-secrets -n mishmob &>/dev/null && echo "✓ postgres-secrets" || echo "✗ postgres-secrets (missing)"
	@kubectl get secret meilisearch-secrets -n mishmob &>/dev/null && echo "✓ meilisearch-secrets" || echo "✗ meilisearch-secrets (missing)"

create-secrets: ## Interactive secret creation for production
	@echo "Creating production secrets..."
	@kubectl create namespace mishmob --dry-run=client -o yaml | kubectl apply -f -
	@echo "Enter Django SECRET_KEY (leave empty to generate):"
	@read -s secret_key; \
	if [ -z "$$secret_key" ]; then \
		secret_key=$$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))'); \
		echo "Generated secret key: $$secret_key"; \
	fi; \
	kubectl create secret generic backend-secrets \
		--from-literal=secret-key="$$secret_key" \
		-n mishmob --dry-run=client -o yaml | kubectl apply -f -
	@echo "Enter PostgreSQL password:"
	@read -s pg_password; \
	kubectl create secret generic postgres-secrets \
		--from-literal=username='postgres' \
		--from-literal=password="$$pg_password" \
		-n mishmob --dry-run=client -o yaml | kubectl apply -f -
	@echo "Enter Meilisearch master key (min 32 chars):"
	@read -s meili_key; \
	kubectl create secret generic meilisearch-secrets \
		--from-literal=master-key="$$meili_key" \
		-n mishmob --dry-run=client -o yaml | kubectl apply -f -

# Quick commands
quick-deploy: build deploy ## Build and deploy in one command
	@echo "Build and deploy complete!"

rollback: ## Rollback production deployment
	kubectl rollout undo deployment/web-backend -n mishmob
	kubectl rollout undo deployment/web-ui -n mishmob