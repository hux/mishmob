#!/bin/bash

# iOS Simulator Fix Script
set -e

echo "=== iOS Simulator Fix Script ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}This script is only for macOS${NC}"
    exit 1
fi

echo "1. Checking Xcode installation..."
if ! command -v xcode-select &> /dev/null; then
    echo -e "${RED}✗ Xcode Command Line Tools not installed${NC}"
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
    exit 1
fi

XCODE_PATH=$(xcode-select -p)
echo -e "${GREEN}✓ Xcode Command Line Tools installed at: $XCODE_PATH${NC}"

echo ""
echo "2. Checking available iOS simulators..."
echo "Available devices:"
xcrun simctl list devices available

echo ""
echo "3. Checking for iOS runtime issues..."

# Check if any runtimes are installed
RUNTIME_COUNT=$(xcrun simctl list runtimes | grep -c "iOS" || echo "0")
if [ "$RUNTIME_COUNT" -eq "0" ]; then
    echo -e "${RED}✗ No iOS runtimes found${NC}"
    echo ""
    echo "To fix this issue:"
    echo "1. Open Xcode"
    echo "2. Go to Xcode > Settings (or Preferences)"
    echo "3. Click on the 'Platforms' tab"
    echo "4. Download the iOS Simulator runtime (it's several GB)"
    echo ""
    echo "Opening Xcode now..."
    open -a Xcode
else
    echo -e "${GREEN}✓ Found $RUNTIME_COUNT iOS runtime(s)${NC}"
    
    # Try to boot a default simulator
    echo ""
    echo "4. Attempting to start iPhone 15 simulator..."
    if xcrun simctl boot "iPhone 15" 2>/dev/null; then
        echo -e "${GREEN}✓ Successfully booted iPhone 15${NC}"
    else
        echo -e "${YELLOW}! Could not boot iPhone 15, trying to create one...${NC}"
        
        # Get the latest iOS runtime
        RUNTIME=$(xcrun simctl list runtimes | grep "iOS" | tail -1 | awk '{print $NF}')
        if [ -n "$RUNTIME" ]; then
            echo "Creating iPhone 15 with runtime: $RUNTIME"
            xcrun simctl create "iPhone 15" "iPhone 15" "$RUNTIME"
            echo -e "${GREEN}✓ Created iPhone 15 simulator${NC}"
        fi
    fi
fi

echo ""
echo "5. Alternative solutions:"
echo ""
echo -e "${BLUE}Option A: Use Expo Go on your physical device${NC}"
echo "   Run: make mobile"
echo "   Then scan the QR code with Expo Go app"
echo ""
echo -e "${BLUE}Option B: Use web version for testing${NC}"
echo "   Run: make mobile-web"
echo ""
echo -e "${BLUE}Option C: Use Android emulator${NC}"
echo "   Run: make mobile-android"
echo ""
echo -e "${BLUE}Option D: Manually select a different simulator${NC}"
echo "   cd mobile && expo start --ios --simulator=\"[DEVICE_NAME]\""
echo "   Available devices:"
xcrun simctl list devices available | grep "iPhone" | grep -v "unavailable" | head -5

echo ""
echo "=== Fix Script Complete ==="