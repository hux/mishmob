#!/bin/bash

# MishMob iOS TestFlight Preparation Script
# Run this after your Apple Developer account is approved

set -e

echo "🚀 Preparing MishMob for TestFlight..."

# Step 1: Clean and reinstall dependencies
echo "📦 Cleaning and reinstalling dependencies..."
cd "$(dirname "$0")/.."
npm ci
cd ios && pod install && cd ..

# Step 2: Build for release
echo "🔨 Building release version..."
npx react-native run-ios --configuration Release --simulator="iPhone 15"

# Step 3: Archive for App Store
echo "📱 Creating archive for App Store..."
xcodebuild -workspace ios/MishMobMobile.xcworkspace \
  -scheme MishMobMobile \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath build/MishMob.xcarchive \
  archive

echo "✅ Archive created! Next steps:"
echo "1. Open Xcode and go to Window > Organizer"
echo "2. Select your archive and click 'Distribute App'"
echo "3. Choose 'App Store Connect' and follow the wizard"
echo "4. Upload to TestFlight"

echo ""
echo "📋 Checklist before uploading:"
echo "- ✅ Bundle ID: com.mishmob.mobile"
echo "- ✅ App Name: MishMob"  
echo "- ✅ Version: 1.0 (Build 1)"
echo "- ✅ Permissions: Camera, Location"
echo "- ⏳ Code Signing: Add your certificates"
echo "- ⏳ App Store Connect: Create app record"