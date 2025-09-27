#!/bin/bash

# Mobile Setup Test Script
set -e

echo "=== MishMob Mobile Setup Diagnostic ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check npm
echo ""
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check if in mobile directory
echo ""
echo "3. Checking mobile directory..."
if [ -f "mobile/package.json" ]; then
    echo -e "${GREEN}✓ Mobile directory found${NC}"
else
    echo -e "${RED}✗ Not in project root directory${NC}"
    exit 1
fi

# Check if dependencies are installed
echo ""
echo "4. Checking if dependencies are installed..."
if [ -d "mobile/node_modules" ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
else
    echo -e "${YELLOW}! node_modules not found - run 'make mobile-install'${NC}"
fi

# Check Expo CLI
echo ""
echo "5. Checking Expo CLI..."
cd mobile
if npx expo --version &> /dev/null; then
    EXPO_VERSION=$(npx expo --version)
    echo -e "${GREEN}✓ Expo CLI available: $EXPO_VERSION${NC}"
else
    echo -e "${RED}✗ Expo CLI not available${NC}"
fi

# Check iOS environment (Mac only)
echo ""
echo "6. Checking iOS development environment..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcrun &> /dev/null; then
        echo -e "${GREEN}✓ Xcode Command Line Tools installed${NC}"
        
        # Check for simulators
        echo "   Checking iOS simulators..."
        SIMULATOR_COUNT=$(xcrun simctl list devices available | grep -c "iPhone\|iPad" || true)
        if [ $SIMULATOR_COUNT -gt 0 ]; then
            echo -e "${GREEN}   ✓ Found $SIMULATOR_COUNT iOS simulators${NC}"
        else
            echo -e "${YELLOW}   ! No iOS simulators found - install via Xcode${NC}"
        fi
    else
        echo -e "${YELLOW}! Xcode Command Line Tools not installed${NC}"
    fi
else
    echo -e "${YELLOW}! Not on macOS - iOS development not available${NC}"
fi

# Check Android environment
echo ""
echo "7. Checking Android development environment..."
if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
    echo -e "${GREEN}✓ Android SDK environment variable set${NC}"
    
    # Check for emulators
    if command -v emulator &> /dev/null; then
        echo "   Checking Android emulators..."
        EMULATOR_COUNT=$(emulator -list-avds 2>/dev/null | wc -l || echo "0")
        if [ $EMULATOR_COUNT -gt 0 ]; then
            echo -e "${GREEN}   ✓ Found $EMULATOR_COUNT Android emulators${NC}"
        else
            echo -e "${YELLOW}   ! No Android emulators found${NC}"
        fi
    fi
else
    echo -e "${YELLOW}! ANDROID_HOME not set - Android development may not work${NC}"
fi

# Test starting Expo
echo ""
echo "8. Testing Expo start (will timeout in 10 seconds)..."
cd ../mobile
timeout 10 npx expo start --non-interactive 2>&1 | head -20 || true

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "Next steps:"
echo "1. If dependencies are not installed: make mobile-install"
echo "2. For iOS: make mobile-ios"
echo "3. For Android: make mobile-android"
echo "4. For physical device: make mobile"