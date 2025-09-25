#!/bin/bash

# MishMob Complete Development Environment Startup Script
# Starts all services: Backend, Frontend, iOS Simulator, and Android Emulator

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${PURPLE}ℹ${NC} $1"
}

# Function to check if a service is running
is_service_running() {
    local service=$1
    case $service in
        "docker")
            docker info &> /dev/null
            ;;
        "backend")
            curl -s http://localhost:8001/api/docs &> /dev/null
            ;;
        "frontend")
            curl -s http://localhost:5175 &> /dev/null
            ;;
        "ios")
            pgrep -x "Simulator" > /dev/null
            ;;
        "android")
            command -v adb &> /dev/null && adb devices 2>/dev/null | grep -q "emulator"
            ;;
    esac
}

# Function to wait for service
wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    print_info "Waiting for $service to start..."
    
    while ! curl -s "$url" &> /dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            print_error "$service failed to start"
            return 1
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_success "$service is ready"
}

# Main script
echo -e "${PURPLE}🚀 MishMob Development Environment Startup${NC}"
echo "=========================================="

# Check Docker
print_step "Checking Docker..."
if ! is_service_running "docker"; then
    print_warning "Docker is not running. Starting Docker Desktop..."
    open -a Docker
    
    # Wait for Docker to start
    while ! is_service_running "docker"; do
        echo -n "."
        sleep 2
    done
    echo ""
fi
print_success "Docker is running"

# Start backend services
print_step "Starting backend services..."
docker-compose up -d db redis search

# Wait for database
print_info "Waiting for PostgreSQL..."
until docker-compose exec -T db pg_isready -U postgres -p 5433 &> /dev/null; do
    echo -n "."
    sleep 1
done
echo ""
print_success "Database is ready"

# Start backend API
docker-compose up -d backend

# Start frontend
print_step "Starting frontend..."
docker-compose up -d web

# Wait for services to be ready
wait_for_service "Backend API" "http://localhost:8001/api/docs"
wait_for_service "Frontend" "http://localhost:5175"

# Mobile app setup
print_step "Starting mobile apps..."

# Check if using React Native CLI or Expo
MOBILE_DIR="mobile-cli"
if [ ! -d "$MOBILE_DIR" ]; then
    MOBILE_DIR="mobile"
    print_info "Using Expo mobile directory"
fi

cd "$MOBILE_DIR"

# Start Metro bundler in background
print_info "Starting Metro bundler..."
npx react-native start --reset-cache > /tmp/metro.log 2>&1 &
METRO_PID=$!
sleep 5

# iOS Simulator
print_step "Starting iOS Simulator..."
if ! is_service_running "ios"; then
    # Open iOS Simulator
    open -a Simulator
    sleep 3
    
    # Wait for simulator to boot
    print_info "Waiting for iOS Simulator to boot..."
    xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || true
    sleep 5
fi

# Launch iOS app
print_info "Building and launching iOS app..."
(
    npx react-native run-ios --simulator="iPhone 15 Pro" > /tmp/ios-build.log 2>&1 &
    IOS_PID=$!
    
    # Show progress
    while ps -p $IOS_PID > /dev/null; do
        echo -n "."
        sleep 2
    done
    
    if wait $IOS_PID; then
        echo ""
        print_success "iOS app launched successfully"
    else
        echo ""
        print_warning "iOS app launch failed. Check /tmp/ios-build.log for details"
    fi
) &

# Android Emulator
print_step "Starting Android Emulator..."

# Check if Android SDK is installed
if [ ! -d "$HOME/Library/Android/sdk" ] || ! command -v adb &> /dev/null || ! command -v emulator &> /dev/null; then
    print_warning "Android SDK not found or not in PATH"
    print_info "Please install Android Studio and run: ./scripts/setup-android.sh"
    print_info "Skipping Android emulator startup"
else
    if ! is_service_running "android"; then
        # Get first available AVD
        AVD_NAME=$(emulator -list-avds 2>/dev/null | head -1)
        
        if [ -z "$AVD_NAME" ]; then
            print_warning "No Android Virtual Device found"
            print_info "Please create an AVD in Android Studio: Tools > AVD Manager"
            print_info "Or run: ./scripts/setup-android.sh"
        else
            print_info "Starting Android emulator: $AVD_NAME"
            emulator -avd "$AVD_NAME" -no-audio -no-window > /tmp/emulator.log 2>&1 &
            
            # Wait for emulator to boot
            print_info "Waiting for Android emulator to boot..."
            adb wait-for-device
            
            # Wait for boot animation to finish
            while [ "$(adb shell getprop sys.boot_completed 2>/dev/null)" != "1" ]; do
                echo -n "."
                sleep 2
            done
            echo ""
        fi
    fi
fi

# Launch Android app
if is_service_running "android"; then
    print_info "Building and launching Android app..."
    (
        npx react-native run-android > /tmp/android-build.log 2>&1 &
        ANDROID_PID=$!
        
        # Show progress
        while ps -p $ANDROID_PID > /dev/null; do
            echo -n "."
            sleep 2
        done
        
        if wait $ANDROID_PID; then
            echo ""
            print_success "Android app launched successfully"
        else
            echo ""
            print_warning "Android app launch failed. Check /tmp/android-build.log for details"
        fi
    ) &
fi

cd ..

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 All services are starting up!${NC}"
echo ""
echo "Access points:"
echo "  📱 ${BLUE}Web App:${NC} http://localhost:5175"
echo "  📚 ${BLUE}API Docs:${NC} http://localhost:8001/api/docs"
echo "  🔧 ${BLUE}Django Admin:${NC} http://localhost:8001/admin"
echo "  🔍 ${BLUE}Meilisearch:${NC} http://localhost:7701"
echo ""
echo "Mobile apps:"
echo "  📱 ${BLUE}iOS:${NC} Building and launching on iPhone 15 Pro"
echo "  🤖 ${BLUE}Android:${NC} Building and launching on emulator"
echo ""
echo "Logs:"
echo "  ${YELLOW}Metro:${NC} tail -f /tmp/metro.log"
echo "  ${YELLOW}iOS Build:${NC} tail -f /tmp/ios-build.log"
echo "  ${YELLOW}Android Build:${NC} tail -f /tmp/android-build.log"
echo "  ${YELLOW}Docker:${NC} docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  ${RED}./scripts/stop-all.sh${NC} (or press Ctrl+C here)"
echo ""

# Keep script running and handle cleanup
cleanup() {
    echo ""
    print_warning "Shutting down services..."
    
    # Kill Metro bundler
    if [ ! -z "$METRO_PID" ]; then
        kill $METRO_PID 2>/dev/null || true
    fi
    
    # Stop Docker services
    docker-compose down
    
    print_success "All services stopped"
    exit 0
}

trap cleanup INT

# Keep the script running
print_info "Press Ctrl+C to stop all services"
wait