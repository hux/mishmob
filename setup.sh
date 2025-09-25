#!/bin/bash

# MishMob Development Environment Setup Script for macOS
# This script installs all prerequisites and sets up the development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

print_step "Starting MishMob development environment setup..."

# Check for Homebrew
print_step "Checking for Homebrew..."
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ -d "/opt/homebrew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    print_success "Homebrew is installed"
    brew update
fi

# Install Node.js
print_step "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing via Homebrew..."
    brew install node@20
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_warning "Node.js version is less than 20. Upgrading..."
        brew install node@20
        brew link --overwrite node@20
    else
        print_success "Node.js $(node -v) is installed"
    fi
fi

# Install Python
print_step "Checking for Python..."
if ! command -v python3 &> /dev/null; then
    print_warning "Python not found. Installing via Homebrew..."
    brew install python@3.11
else
    print_success "Python $(python3 --version) is installed"
fi

# Install Docker
print_step "Checking for Docker..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker Desktop..."
    brew install --cask docker
    print_warning "Please start Docker Desktop from Applications before continuing"
    read -p "Press Enter once Docker Desktop is running..."
else
    print_success "Docker is installed"
fi

# Install Watchman (for React Native)
print_step "Installing Watchman..."
if ! command -v watchman &> /dev/null; then
    brew install watchman
else
    print_success "Watchman is installed"
fi

# Install CocoaPods
print_step "Installing CocoaPods..."
if ! command -v pod &> /dev/null; then
    sudo gem install cocoapods
else
    print_success "CocoaPods is installed"
fi

# Check for Xcode
print_step "Checking for Xcode..."
if ! xcode-select -p &> /dev/null; then
    print_warning "Xcode Command Line Tools not found. Installing..."
    xcode-select --install
    print_warning "Please complete the Xcode installation and press Enter..."
    read -p "Press Enter once installation is complete..."
else
    print_success "Xcode Command Line Tools are installed"
fi

# Check if full Xcode is installed
if [ -d "/Applications/Xcode.app" ]; then
    print_success "Xcode app is installed"
    # Accept Xcode license if needed
    sudo xcodebuild -license accept 2>/dev/null || true
else
    print_warning "Full Xcode app not found. Please install from App Store for iOS development"
fi

# Install React Native CLI
print_step "Installing React Native CLI..."
npm install -g react-native-cli

# Check for Android Studio and SDK
print_step "Checking for Android development setup..."
ANDROID_SETUP_REQUIRED=false

if [ ! -d "$HOME/Library/Android/sdk" ] || [ ! -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    print_warning "Android SDK not found or incomplete!"
    echo ""
    echo "Please install Android Studio to enable Android development:"
    echo "1. Download Android Studio from: ${BLUE}https://developer.android.com/studio${NC}"
    echo "2. Install and open Android Studio"
    echo "3. Go through the initial setup wizard"
    echo "4. Open ${YELLOW}Tools > SDK Manager${NC}"
    echo "5. Install Android SDK Platform 34"
    echo "6. Open ${YELLOW}Tools > AVD Manager${NC}"
    echo "7. Create a new Virtual Device (e.g., Pixel 7 Pro)"
    echo ""
    echo "After installation, run: ${GREEN}./scripts/setup-android.sh${NC}"
    echo ""
    ANDROID_SETUP_REQUIRED=true
else
    print_success "Android SDK found at $HOME/Library/Android/sdk"
    
    # Check if platform-tools are accessible
    if [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
        print_success "Android platform-tools found"
    else
        print_warning "Android platform-tools missing. Run ./scripts/setup-android.sh after this setup"
        ANDROID_SETUP_REQUIRED=true
    fi
fi

# Setup Android environment variables
print_step "Setting up Android environment variables..."
SHELL_CONFIG="$HOME/.zshrc"
if [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if ! grep -q "ANDROID_HOME" "$SHELL_CONFIG" 2>/dev/null; then
    echo "" >> "$SHELL_CONFIG"
    echo "# Android SDK environment variables" >> "$SHELL_CONFIG"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_CONFIG"
    print_success "Android environment variables added to $SHELL_CONFIG"
    source "$SHELL_CONFIG"
else
    print_success "Android environment variables already configured"
fi

# Install additional useful tools
print_step "Installing additional development tools..."
brew install git jq

# Clone the repository if not already in it
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_step "Repository structure not found. Are you in the MishMob directory?"
    read -p "Would you like to clone the repository? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter the repository URL: " REPO_URL
        git clone "$REPO_URL" mishmob-temp
        cd mishmob-temp
    fi
fi

# Install project dependencies
print_step "Installing project dependencies..."

# Backend setup
if [ -f "backend/requirements.txt" ]; then
    print_step "Setting up Python virtual environment..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip first
    pip install --upgrade pip
    
    # Install requirements with updated psycopg version
    print_step "Installing backend dependencies..."
    if ! pip install -r requirements.txt; then
        print_error "Failed to install backend dependencies"
        print_warning "This might be due to psycopg-binary version issues"
        print_warning "Try running: pip install psycopg[binary]==3.2.3"
        deactivate
        cd ..
        exit 1
    fi
    
    deactivate
    cd ..
    print_success "Backend dependencies installed"
fi

# Frontend setup
if [ -f "frontend/package.json" ]; then
    print_step "Installing frontend dependencies..."
    cd frontend
    # Clean install to avoid conflicts
    rm -rf node_modules package-lock.json
    npm install
    
    # Run audit fix if there are vulnerabilities
    if npm audit &>/dev/null; then
        print_step "Running npm audit fix..."
        npm audit fix || true
    fi
    
    cd ..
    print_success "Frontend dependencies installed"
fi

# Mobile setup - React Native CLI
if [ -f "mobile-cli/package.json" ]; then
    print_step "Installing React Native CLI mobile dependencies..."
    cd mobile-cli
    # Clean install to avoid conflicts
    rm -rf node_modules package-lock.json
    npm install
    
    # Install babel resolver for path aliases
    npm install --save-dev babel-plugin-module-resolver
    
    # Run audit fix if there are vulnerabilities
    if npm audit &>/dev/null; then
        print_step "Running npm audit fix..."
        npm audit fix || true
    fi
    
    # Install iOS dependencies if on macOS
    if [ -d "ios" ]; then
        print_step "Installing iOS dependencies with CocoaPods..."
        cd ios
        pod install
        cd ..
    fi
    
    # Setup Android local properties
    if [ -d "android" ] && [ ! -f "android/local.properties" ]; then
        print_step "Setting up Android local properties..."
        echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
    fi
    
    cd ..
    print_success "React Native CLI mobile dependencies installed"
fi

# Mobile setup - Expo (if exists)
if [ -f "mobile/package.json" ]; then
    print_step "Installing Expo mobile dependencies..."
    cd mobile
    # Clean install to avoid conflicts
    rm -rf node_modules package-lock.json
    npm install
    
    # Run audit fix if there are vulnerabilities
    if npm audit &>/dev/null; then
        print_step "Running npm audit fix..."
        npm audit fix || true
    fi
    
    cd ..
    print_success "Expo mobile dependencies installed"
fi

# Create .env files
print_step "Setting up environment files..."
if [ -f "backend/.env.example" ] && [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_success "Created backend/.env from template"
fi

# Final setup steps
print_step "Running final setup..."

# Create necessary directories
mkdir -p shared/api-types shared/constants shared/utils

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Summary
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart your terminal to load environment variables"
echo "2. Run './scripts/verify-setup.sh' to verify installation"
echo "3. For Android setup, run './scripts/setup-android.sh'"
echo "4. Run './scripts/quick-start.sh' to start all services"
echo "5. Run './scripts/start-mobile.sh' for mobile app options"
echo ""
echo "Quick commands:"
echo "  ${GREEN}./scripts/quick-start.sh${NC} - Start all backend services"
echo "  ${GREEN}./scripts/start-mobile.sh${NC} - Interactive mobile app launcher"
echo "  ${GREEN}./scripts/verify-setup.sh${NC} - Check your environment"
echo "  ${GREEN}./scripts/setup-android.sh${NC} - Complete Android setup"
echo ""
echo "Manual commands:"
echo "  - Start services: docker-compose up -d"
echo "  - iOS Simulator: cd mobile && npx react-native run-ios"
echo "  - Android Emulator: cd mobile && npx react-native run-android"
echo "  - Expo: cd mobile && npx expo start"
echo ""

# Check React Native setup
print_step "Running React Native environment check..."
if [ -d "mobile" ]; then
    cd mobile && npx react-native doctor || true
    cd ..
fi

echo ""
print_success "Setup script completed!"
print_warning "⚠️  IMPORTANT: Restart your terminal now to load all environment variables!"
echo ""
echo "After restarting your terminal, run:"
echo "  ${GREEN}./scripts/verify-setup.sh${NC}"