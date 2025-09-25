#!/bin/bash

# MishMob Android Development Setup Script
# This script sets up Android SDK and emulator for React Native development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo -e "${BLUE}Android Development Setup for MishMob${NC}"
echo "======================================"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
    print_success "Android Studio is installed"
else
    print_warning "Android Studio not found"
    echo ""
    echo "Would you like to:"
    echo "1. Download and install Android Studio manually (recommended)"
    echo "2. Install Android Command Line Tools only"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "Please download and install Android Studio from:"
        echo "${BLUE}https://developer.android.com/studio${NC}"
        echo ""
        echo "After installation:"
        echo "1. Open Android Studio"
        echo "2. Go through the setup wizard"
        echo "3. Install the default SDK packages"
        echo ""
        read -p "Press Enter after installing Android Studio..."
    fi
fi

# Check for Android SDK
if [ -d "$HOME/Library/Android/sdk" ] && [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    print_success "Android SDK found at $HOME/Library/Android/sdk"
else
    print_warning "Android SDK not found or incomplete"
    
    if [ "$choice" = "2" ] || [ -z "$choice" ]; then
        print_step "Installing Android Command Line Tools..."
        
        # Create Android SDK directory
        mkdir -p "$HOME/Library/Android/sdk"
        
        # Download Android command line tools
        print_step "Downloading Android Command Line Tools..."
        CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
        
        if ! curl -L -o /tmp/cmdline-tools.zip "$CMDLINE_TOOLS_URL"; then
            print_error "Failed to download Android Command Line Tools"
            exit 1
        fi
        
        # Extract to proper location
        print_step "Extracting Command Line Tools..."
        mkdir -p "$HOME/Library/Android/sdk/cmdline-tools"
        unzip -q /tmp/cmdline-tools.zip -d "$HOME/Library/Android/sdk/cmdline-tools"
        
        # Move to 'latest' directory as required by Android SDK
        if [ -d "$HOME/Library/Android/sdk/cmdline-tools/cmdline-tools" ]; then
            mv "$HOME/Library/Android/sdk/cmdline-tools/cmdline-tools" "$HOME/Library/Android/sdk/cmdline-tools/latest"
        fi
        
        rm -f /tmp/cmdline-tools.zip
        print_success "Android Command Line Tools installed"
    fi
fi

# Set environment variables
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

# Update shell configuration
print_step "Setting up environment variables..."
SHELL_CONFIG="$HOME/.zshrc"
if [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

# Check if environment variables are already set
if ! grep -q "ANDROID_HOME" "$SHELL_CONFIG" 2>/dev/null; then
    echo "" >> "$SHELL_CONFIG"
    echo "# Android SDK environment variables" >> "$SHELL_CONFIG"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_CONFIG"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_CONFIG"
    print_success "Added Android environment variables to $SHELL_CONFIG"
else
    print_success "Android environment variables already configured"
fi

# Install Java if needed
print_step "Checking Java installation..."
if ! java -version &> /dev/null; then
    print_warning "Java not found. Installing OpenJDK 11..."
    brew install openjdk@11
    sudo ln -sfn $(brew --prefix)/opt/openjdk@11/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-11.jdk
else
    print_success "Java is installed"
fi

# Install Android SDK packages
if [ -d "$HOME/Library/Android/sdk" ]; then
    print_step "Installing required Android SDK packages..."
    
    # Accept licenses
    print_step "Accepting Android SDK licenses..."
    yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses &>/dev/null || true
    
    # Install required SDK components
    print_step "Installing Android SDK components (this may take a while)..."
    
    # Determine architecture for system images
    ARCH="arm64-v8a"
    if [[ $(uname -m) == "x86_64" ]]; then
        ARCH="x86_64"
    fi
    
    # List of components to install
    COMPONENTS=(
        "platform-tools"
        "platforms;android-34"
        "build-tools;34.0.0"
        "emulator"
        "system-images;android-34;google_apis;$ARCH"
        "extras;google;google_play_services"
        "extras;android;m2repository"
        "extras;google;m2repository"
    )
    
    # Install each component
    for component in "${COMPONENTS[@]}"; do
        print_step "Installing $component..."
        if "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "$component"; then
            print_success "Installed $component"
        else
            print_warning "Failed to install $component (may already be installed)"
        fi
    done
fi

# Create AVD if none exists
print_step "Checking for Android Virtual Devices..."
AVD_LIST=$("$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" list avd 2>/dev/null | grep "Name:" || true)

if [ -z "$AVD_LIST" ]; then
    print_warning "No Android Virtual Device found. Creating one..."
    
    # Determine architecture for AVD
    ARCH="arm64-v8a"
    if [[ $(uname -m) == "x86_64" ]]; then
        ARCH="x86_64"
    fi
    
    echo "no" | "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" create avd \
        -n "Pixel_7_Pro_API_34" \
        -k "system-images;android-34;google_apis;$ARCH" \
        -d "pixel_7_pro" \
        --force
    
    print_success "Created Android Virtual Device: Pixel_7_Pro_API_34"
else
    print_success "Android Virtual Devices found:"
    echo "$AVD_LIST"
fi

# Verify installation
print_step "Verifying Android SDK installation..."

# Check adb
if "$ANDROID_HOME/platform-tools/adb" version &>/dev/null; then
    print_success "ADB is working"
    "$ANDROID_HOME/platform-tools/adb" version | head -1
else
    print_error "ADB is not working properly"
fi

# Check emulator
if "$ANDROID_HOME/emulator/emulator" -version &>/dev/null; then
    print_success "Android Emulator is working"
else
    print_error "Android Emulator is not working properly"
fi

# List available AVDs
print_step "Available Android Virtual Devices:"
"$ANDROID_HOME/emulator/emulator" -list-avds

# Final instructions
echo ""
echo -e "${GREEN}🎉 Android SDK Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. ${YELLOW}Restart your terminal${NC} to load environment variables"
echo "2. Run '${GREEN}adb devices${NC}' to verify ADB is working"
echo "3. Run '${GREEN}emulator -list-avds${NC}' to see available virtual devices"
echo "4. Run '${GREEN}emulator @Pixel_7_Pro_API_34${NC}' to start the emulator"
echo ""
echo "Or use the start script:"
echo "  ${GREEN}../start.sh${NC} - Will start all services including Android emulator"
echo ""
echo "To run the mobile app:"
echo "  ${GREEN}cd ../mobile-cli && npx react-native run-android${NC}"
echo ""
print_warning "Note: First emulator start may take several minutes to boot"