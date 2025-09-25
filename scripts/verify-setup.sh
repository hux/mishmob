#!/bin/bash

# MishMob Setup Verification Script
# Checks if all prerequisites are properly installed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Tracking variables
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0

check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if command -v "$cmd" &> /dev/null; then
        if [ -n "$min_version" ]; then
            version=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
            echo -e "${GREEN}✓${NC} $name is installed (version: $version)"
        else
            echo -e "${GREEN}✓${NC} $name is installed"
        fi
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $name is not installed"
        return 1
    fi
}

check_directory() {
    local dir=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $name found at $dir"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $name not found at $dir"
        return 1
    fi
}

check_env_var() {
    local var=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✓${NC} $name is set: ${!var}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $name is not set"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo -e "${BLUE}MishMob Development Environment Verification${NC}"
echo "============================================="
echo ""

# Core tools
echo -e "${BLUE}Core Development Tools:${NC}"
check_command "git" "Git"
check_command "node" "Node.js" "20"
check_command "npm" "npm"
check_command "python3" "Python" "3.8"
check_command "docker" "Docker"
check_command "docker-compose" "Docker Compose"

echo ""
echo -e "${BLUE}React Native Tools:${NC}"
check_command "watchman" "Watchman"
check_command "pod" "CocoaPods"
check_command "react-native" "React Native CLI"
check_command "expo" "Expo CLI"

echo ""
echo -e "${BLUE}iOS Development:${NC}"
if check_command "xcodebuild" "Xcode Command Line Tools"; then
    xcode_version=$(xcodebuild -version 2>/dev/null | head -1 || echo "Unknown")
    echo "  Xcode version: $xcode_version"
fi
check_directory "/Applications/Xcode.app" "Xcode App"

echo ""
echo -e "${BLUE}Android Development:${NC}"
check_directory "$HOME/Library/Android/sdk" "Android SDK"
check_command "adb" "Android Debug Bridge (adb)"
check_command "emulator" "Android Emulator"

echo ""
echo -e "${BLUE}Environment Variables:${NC}"
check_env_var "ANDROID_HOME" "ANDROID_HOME"

# Check if in PATH
if [[ ":$PATH:" == *":$ANDROID_HOME/platform-tools:"* ]]; then
    echo -e "${GREEN}✓${NC} Android platform-tools in PATH"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠${NC} Android platform-tools not in PATH"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""
echo -e "${BLUE}Project Structure:${NC}"
check_directory "backend" "Backend directory"
check_directory "frontend" "Frontend directory"
check_directory "mobile" "Mobile directory"
check_directory "shared" "Shared directory"

echo ""
echo -e "${BLUE}Configuration Files:${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠${NC} Backend .env file not found (will use defaults)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "============================================="
echo -e "Results: ${GREEN}$PASSED_CHECKS/$TOTAL_CHECKS${NC} checks passed"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}$WARNINGS warnings${NC} (non-critical issues)"
fi

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "\n${GREEN}✅ Your environment is fully configured!${NC}"
    exit 0
elif [ $PASSED_CHECKS -gt $((TOTAL_CHECKS - 3)) ]; then
    echo -e "\n${YELLOW}⚠️  Your environment is mostly configured.${NC}"
    echo "Some optional components may be missing."
    exit 0
else
    echo -e "\n${RED}❌ Your environment needs configuration.${NC}"
    echo "Run ./setup.sh to install missing components."
    exit 1
fi