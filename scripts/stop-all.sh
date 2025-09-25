#!/bin/bash

# Stop all MishMob services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping all MishMob services...${NC}"

# Stop Metro bundler
echo "Stopping Metro bundler..."
pkill -f "react-native start" 2>/dev/null || true

# Stop iOS Simulator
echo "Stopping iOS Simulator..."
xcrun simctl shutdown all 2>/dev/null || true
killall Simulator 2>/dev/null || true

# Stop Android Emulator
if command -v adb &> /dev/null; then
    echo "Stopping Android Emulator..."
    adb emu kill 2>/dev/null || true
fi

# Stop Docker services
echo "Stopping Docker services..."
docker-compose down

echo -e "${GREEN}✓ All services stopped${NC}"