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
dev: ## Start ALL local development services (DB, Backend, Frontend, Redis, Meilisearch)
	@echo "Starting all local development services..."
	@echo "This will start:"
	@echo "  - PostgreSQL on port 5433"
	@echo "  - Backend API on http://localhost:8080"
	@echo "  - Frontend on http://localhost:8081"
	@echo "  - Meilisearch on http://localhost:7701"
	@echo "  - Redis on port 6380"
	@echo ""
	docker-compose up -d
	@echo ""
	@echo "Services starting up... Check status with 'make dev-status'"
	@echo "View logs with 'make dev-logs'"
	@echo ""
	@echo "Once ready, access the app at http://localhost:8081"

dev-status: ## Show status of development services
	@docker-compose ps

dev-down: ## Stop all local development services
	docker-compose down

dev-logs: ## Show development logs (use dev-logs backend/web/db/search/redis for specific service)
	docker-compose logs -f $(filter-out $@,$(MAKECMDGOALS))

dev-build: ## Rebuild development containers
	docker-compose build

dev-reset: ## Reset development environment (removes volumes)
	docker-compose down -v
	docker-compose up -d

dev-migrate: ## Run Django migrations
	docker-compose exec backend python manage.py migrate

dev-shell: ## Open Django shell
	docker-compose exec backend python manage.py shell

dev-bash: ## Open bash shell in backend container
	docker-compose exec backend bash

dev-populate: ## Populate sample data
	docker-compose exec backend python manage.py populate_opportunities

dev-createsuperuser: ## Create Django superuser
	docker-compose exec backend python manage.py createsuperuser

# Mobile development
# Note: mobile-ios and mobile-android are defined below as the fresh versions

mobile: mobile-stop-all ## Start fresh development environment with both iOS and Android simulators
	@echo "Starting fresh mobile development environment with both iOS and Android..."
	@echo "Waiting 3 seconds for processes to fully stop..."
	@sleep 3
	@echo "Starting Metro bundler on port 8085..."
	@cd mobile && npm start -- --port=8085 &
	@echo "Waiting for Metro to start..."
	@sleep 5
	@echo "Launching iOS simulator in background..."
	@cd mobile && npm run ios -- --port=8085 &
	@echo "Waiting 3 seconds before starting Android..."
	@sleep 3
	@echo "Launching Android emulator..."
	@cd mobile && npm run android -- --port=8085
	@echo "Both iOS and Android simulators are starting!"
	@echo "Use 'make mobile-logs' to view logs from both platforms"

mobile-web: ## Start mobile app in web browser (if supported)
	@echo "Starting mobile app in web browser..."
	@cd mobile && npm run web || echo "Web support not available in React Native CLI"

mobile-install: ## Install mobile app dependencies
	@echo "Installing mobile app dependencies..."
	@cd mobile && npm install
	@echo "Installing iOS pods (if on macOS)..."
	@cd mobile/ios 2>/dev/null && pod install || echo "iOS pods not available or not on macOS"

mobile-clean: ## Clean mobile app build cache and dependencies
	@echo "Cleaning mobile app cache and dependencies..."
	@cd mobile && rm -rf node_modules package-lock.json .expo
	@cd mobile && rm -rf android/build ios/build || true
	@echo "Clearing Metro cache..."
	@cd mobile && npx react-native start --reset-cache || npm start -- --reset-cache || true
	@echo "Run 'make mobile-install' to reinstall dependencies"

mobile-clear-cache: ## Clear Metro bundler cache
	@echo "Clearing Metro bundler cache..."
	@cd mobile && npx react-native start --reset-cache || npm start -- --reset-cache
	@cd mobile && rm -rf .expo
	@cd mobile && watchman watch-del-all 2>/dev/null || true
	@echo "Clearing temporary Metro cache files..."
	@cd mobile && rm -rf /tmp/metro-* 2>/dev/null || true

mobile-setup: ## Complete mobile setup (clean install)
	@echo "Setting up mobile development environment..."
	@cd mobile && rm -rf node_modules package-lock.json .expo
	@cd mobile && npm install
	@echo "Installing iOS pods (if on macOS)..."
	@cd mobile/ios 2>/dev/null && pod install || echo "iOS pods not available or not on macOS"
	@echo "Mobile setup complete! You can now run 'make mobile-ios' or 'make mobile-android'"

mobile-fix-ios: ## Fix iOS simulator issues
	@echo "Fixing iOS simulator issues..."
	@echo "1. Opening Xcode to download simulators..."
	@open -a Xcode
	@echo "2. Please go to Xcode > Settings > Platforms and download iOS simulators"
	@echo "3. Installing/updating iOS pods..."
	@cd mobile/ios 2>/dev/null && pod install --repo-update || echo "iOS pods not available"
	@echo "4. Listing available simulators:"
	@xcrun simctl list devices available | grep -E "iPhone|iPad" || echo "No simulators found"
	@echo ""
	@echo "If no simulators are available, install them via Xcode"

mobile-ios-device: ## List available iOS simulators and let user choose
	@echo "Available iOS simulators:"
	@xcrun simctl list devices available | grep -E "iPhone|iPad"
	@echo ""
	@echo "To use a specific device, run:"
	@echo "cd mobile && npx react-native run-ios --simulator='iPhone 15'"

mobile-test: ## Test mobile development setup
	@./scripts/test-mobile-setup.sh

mobile-fix-ios-simulator: ## Fix iOS simulator issues
	@./scripts/fix-ios-simulator.sh

mobile-browser: ## Open Metro DevTools in browser
	@echo "Starting Metro bundler and opening DevTools in browser..."
	@echo "This opens the Metro DevTools in your browser"
	@cd mobile && npm start -- --port=8082
	@echo "Open http://localhost:8082 in your browser for Metro DevTools"

mobile-fix-upgrade: ## Fix issues after React Native upgrade
	@echo "Fixing issues after React Native upgrade..."
	@cd mobile && rm -rf node_modules package-lock.json
	@cd mobile && npm install
	@cd mobile/ios 2>/dev/null && pod install || echo "iOS pods not available"
	@cd mobile && npx react-native start --reset-cache || npm start -- --reset-cache
	@echo "React Native upgrade fixes complete"

mobile-metro-start: ## Start Metro bundler only (no simulator)
	@echo "Starting Metro bundler on port 8082..."
	@cd mobile && npm start -- --port=8082

mobile-metro-stop: ## Stop Metro bundler
	@echo "Stopping Metro bundler..."
	@pkill -f "node.*metro" || echo "Metro bundler not running"

mobile-stop-all: ## Stop all mobile simulators and Metro bundlers
	@echo "Stopping all mobile development processes..."
	@echo "Killing all Metro bundlers..."
	@pkill -f "node.*metro" || echo "No Metro bundlers running"
	@pkill -f "react-native start" || echo "No React Native processes running"
	@echo "Stopping Android emulators..."
	@adb emu kill || echo "No Android emulators running"
	@echo "Stopping iOS simulators..."
	@xcrun simctl shutdown all || echo "No iOS simulators running"
	@echo "All mobile processes stopped"

mobile-fresh: mobile ## Alias for 'make mobile' - start fresh environment with both simulators
	@echo "Use 'make mobile' instead - this is an alias"

mobile-ios: mobile-stop-all ## Start fresh iOS simulator only
	@echo "Starting fresh iOS development environment..."
	@echo "Waiting 3 seconds for processes to fully stop..."
	@sleep 3
	@echo "Starting Metro bundler on port 8085..."
	@cd mobile && npm start -- --port=8085 &
	@echo "Waiting for Metro to start..."
	@sleep 5
	@echo "Launching fresh iOS simulator..."
	@cd mobile && npm run ios -- --port=8085
	@echo "Fresh iOS environment ready!"

mobile-android: mobile-stop-all ## Start fresh Android simulator only
	@echo "Starting fresh Android development environment..."
	@echo "Waiting 3 seconds for processes to fully stop..."
	@sleep 3
	@echo "Starting Metro bundler on port 8085..."
	@cd mobile && npm start -- --port=8085 &
	@echo "Waiting for Metro to start..."
	@sleep 5
	@echo "Launching fresh Android emulator..."
	@cd mobile && npm run android -- --port=8085
	@echo "Fresh Android environment ready!"

mobile-logs: ## Show logs from iOS and Android simulators
	@echo "Showing mobile simulator logs (iOS and Android)..."
	@echo "Press Ctrl+C to stop viewing logs"
	@echo "=== iOS Simulator Logs ==="
	@xcrun simctl spawn booted log stream --predicate 'process == "MishMobMobile"' &
	@echo "=== Android Emulator Logs ==="
	@adb logcat | grep -E "(ReactNativeJS|MishMobMobile)" || echo "No Android emulator connected"

mobile-build-ios: ## Build iOS app for production
	@echo "Building iOS app for production..."
	@cd mobile && npx react-native run-ios --configuration Release

mobile-build-android: ## Build Android app for production  
	@echo "Building Android app for production..."
	@cd mobile/android && ./gradlew assembleRelease

mobile-logs-ios: ## Show iOS simulator logs
	@echo "Showing iOS simulator logs..."
	@xcrun simctl spawn booted log stream --predicate 'process == "mishmob-mobile"' || echo "No iOS simulator running"

mobile-logs-android: ## Show Android emulator logs
	@echo "Showing Android emulator logs..."
	@adb logcat | grep -i mishmob || echo "No Android emulator connected"

mobile-doctor: ## Check React Native development environment
	@echo "Checking React Native development environment..."
	@npx react-native doctor || echo "React Native CLI not installed globally"

# Prevent make from treating service names as targets
%:
	@:

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

force-update: ## Force update deployments to pull latest images
	./scripts/force-update.sh

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

# Google Play Store deployment for mobile app
mobile-play-setup: ## Set up Google Play Store deployment (one-time setup)
	@echo "Setting up Google Play Store deployment..."
	@echo "1. Installing fastlane..."
	@cd mobile && bundle install
	@echo "2. Installing fastlane plugin for Google Play..."
	@cd mobile && bundle exec fastlane add_plugin versioning
	@echo ""
	@echo "Setup complete! Next steps:"
	@echo "1. Generate a release keystore: make mobile-play-keystore"
	@echo "2. Set up Google Play Console service account"
	@echo "3. Configure environment variables (see mobile/.env.example)"
	@echo "4. Run 'make mobile-play-build' to test the build"

mobile-play-keystore: ## Generate Android release keystore
	@echo "Generating Android release keystore..."
	@echo "Enter keystore password:"
	@read -s KEYSTORE_PASS; \
	echo "Enter key alias name (e.g., mishmob-release):" && read KEY_ALIAS; \
	echo "Enter key password:" && read -s KEY_PASS; \
	cd mobile/android && \
	keytool -genkey -v -keystore release.keystore -alias $$KEY_ALIAS -keyalg RSA -keysize 2048 -validity 10000 && \
	echo "" && \
	echo "Keystore generated at mobile/android/release.keystore" && \
	echo "Add these to your environment variables:" && \
	echo "ANDROID_KEYSTORE_PATH=android/release.keystore" && \
	echo "ANDROID_KEYSTORE_PASSWORD=$$KEYSTORE_PASS" && \
	echo "ANDROID_KEY_ALIAS=$$KEY_ALIAS" && \
	echo "ANDROID_KEY_PASSWORD=$$KEY_PASS"

mobile-play-clean: ## Clean mobile build artifacts
	@echo "Cleaning mobile build artifacts..."
	@cd mobile/android && ./gradlew clean || echo "Gradle clean failed"
	@cd mobile && rm -rf android/app/build
	@cd mobile && rm -rf node_modules/.cache
	@echo "Mobile build artifacts cleaned"

mobile-play-build: ## Build Android App Bundle for Play Store
	@echo "Building Android App Bundle for Google Play Store..."
	@echo "This will create a release AAB file"
	@cd mobile && npm install
	@cd mobile && bundle exec fastlane android build
	@echo ""
	@echo "Build complete! AAB file location:"
	@echo "mobile/android/app/build/outputs/bundle/release/app-release.aab"

mobile-play-internal: mobile-play-clean ## Deploy to Google Play Internal Testing
	@echo "Deploying to Google Play Internal Testing track..."
	@cd mobile && bundle exec fastlane android internal
	@echo "Deployment to Internal Testing complete!"

mobile-play-alpha: mobile-play-clean ## Deploy to Google Play Alpha Testing
	@echo "Deploying to Google Play Alpha Testing track..."
	@cd mobile && bundle exec fastlane android alpha
	@echo "Deployment to Alpha Testing complete!"

mobile-play-beta: mobile-play-clean ## Deploy to Google Play Beta Testing
	@echo "Deploying to Google Play Beta Testing track..."
	@cd mobile && bundle exec fastlane android beta
	@echo "Deployment to Beta Testing complete!"

mobile-play-production: mobile-play-clean ## Deploy to Google Play Production
	@echo "Deploying to Google Play Production..."
	@echo "WARNING: This will publish to production!"
	@echo "Press Enter to continue or Ctrl+C to cancel"
	@read confirm
	@cd mobile && bundle exec fastlane android production
	@echo "Deployment to Production complete!"

mobile-play-promote-alpha: ## Promote Internal build to Alpha
	@echo "Promoting Internal Testing build to Alpha..."
	@cd mobile && bundle exec fastlane android promote_to_alpha
	@echo "Promotion to Alpha complete!"

mobile-play-promote-beta: ## Promote Alpha build to Beta
	@echo "Promoting Alpha Testing build to Beta..."
	@cd mobile && bundle exec fastlane android promote_to_beta
	@echo "Promotion to Beta complete!"

mobile-play-promote-production: ## Promote Beta build to Production
	@echo "Promoting Beta Testing build to Production..."
	@echo "WARNING: This will publish to production!"
	@echo "Press Enter to continue or Ctrl+C to cancel"
	@read confirm
	@cd mobile && bundle exec fastlane android promote_to_production
	@echo "Promotion to Production complete!"

mobile-play-status: ## Check Google Play Console deployment status
	@echo "Checking Google Play Console status..."
	@cd mobile && bundle exec fastlane run google_play_track_version_codes package_name:com.mishmobmobile track:internal
	@cd mobile && bundle exec fastlane run google_play_track_version_codes package_name:com.mishmobmobile track:alpha
	@cd mobile && bundle exec fastlane run google_play_track_version_codes package_name:com.mishmobmobile track:beta
	@cd mobile && bundle exec fastlane run google_play_track_version_codes package_name:com.mishmobmobile track:production

# iOS TestFlight deployment
mobile-testflight-prepare: ## Prepare iOS app for TestFlight submission
	@echo "Preparing iOS app for TestFlight..."
	@cd mobile && chmod +x scripts/prepare-testflight.sh
	@cd mobile && ./scripts/prepare-testflight.sh

mobile-ios-archive: ## Create iOS archive for App Store
	@echo "Creating iOS archive for App Store..."
	@cd mobile && xcodebuild -workspace ios/MishMobMobile.xcworkspace \
		-scheme MishMobMobile \
		-configuration Release \
		-destination generic/platform=iOS \
		-archivePath build/MishMob.xcarchive \
		archive
	@echo "Archive created at mobile/build/MishMob.xcarchive"
	@echo "Open Xcode Organizer to upload to TestFlight"

mobile-ios-clean: ## Clean iOS build artifacts
	@echo "Cleaning iOS build artifacts..."
	@cd mobile/ios && xcodebuild clean -workspace MishMobMobile.xcworkspace -scheme MishMobMobile
	@cd mobile && rm -rf ios/build
	@cd mobile && rm -rf build
	@echo "iOS build artifacts cleaned"