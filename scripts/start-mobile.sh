#!/bin/bash

# Mobile App Start Script
# Helps start the React Native app with various options

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_menu() {
    echo -e "${BLUE}MishMob Mobile App Launcher${NC}"
    echo "=========================="
    echo "1) iOS Simulator"
    echo "2) Android Emulator"
    echo "3) Both (iOS + Android)"
    echo "4) Expo Go (QR Code)"
    echo "5) Physical iOS Device"
    echo "6) Physical Android Device"
    echo "0) Exit"
    echo ""
}

start_ios() {
    echo -e "${BLUE}Starting iOS app...${NC}"
    cd mobile
    
    # Check if pods are installed
    if [ ! -d "ios/Pods" ]; then
        echo "Installing CocoaPods dependencies..."
        cd ios && pod install && cd ..
    fi
    
    # Open simulator if not already open
    if ! pgrep -x "Simulator" > /dev/null; then
        open -a Simulator
        sleep 3
    fi
    
    npx react-native run-ios
}

start_android() {
    echo -e "${BLUE}Starting Android app...${NC}"
    
    # Check if emulator is running
    if ! adb devices | grep -q "emulator"; then
        echo -e "${YELLOW}No Android emulator detected${NC}"
        echo "Available emulators:"
        emulator -list-avds
        echo ""
        read -p "Enter emulator name to start (or press Enter to skip): " AVD_NAME
        if [ -n "$AVD_NAME" ]; then
            echo "Starting emulator $AVD_NAME..."
            emulator -avd "$AVD_NAME" &
            echo "Waiting for emulator to boot..."
            adb wait-for-device
            sleep 10
        fi
    fi
    
    cd mobile
    npx react-native run-android
}

start_expo() {
    echo -e "${BLUE}Starting Expo...${NC}"
    cd mobile
    npx expo start
}

start_physical_ios() {
    echo -e "${BLUE}Starting on physical iOS device...${NC}"
    echo "Make sure your device is:"
    echo "1. Connected via USB"
    echo "2. Trusted this computer"
    echo "3. Developer mode is enabled"
    read -p "Press Enter to continue..."
    
    cd mobile
    npx react-native run-ios --device
}

start_physical_android() {
    echo -e "${BLUE}Starting on physical Android device...${NC}"
    echo "Make sure your device has:"
    echo "1. Developer mode enabled"
    echo "2. USB debugging enabled"
    echo "3. Connected via USB"
    
    echo ""
    echo "Connected devices:"
    adb devices
    echo ""
    read -p "Press Enter to continue..."
    
    cd mobile
    npx react-native run-android
}

# Main menu loop
while true; do
    print_menu
    read -p "Select an option: " choice
    
    case $choice in
        1)
            start_ios
            break
            ;;
        2)
            start_android
            break
            ;;
        3)
            # Start both in separate terminals
            osascript -e 'tell app "Terminal" to do script "cd '"$PWD"' && ./scripts/start-mobile.sh && echo 1 | head -1"'
            sleep 2
            start_android
            break
            ;;
        4)
            start_expo
            break
            ;;
        5)
            start_physical_ios
            break
            ;;
        6)
            start_physical_android
            break
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${YELLOW}Invalid option${NC}"
            sleep 1
            ;;
    esac
done