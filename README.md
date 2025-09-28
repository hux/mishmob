# MishMob - Mission Mobilization Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue" alt="React">
  <img src="https://img.shields.io/badge/React_Native-0.74-green" alt="React Native">
  <img src="https://img.shields.io/badge/Django-5.1-darkgreen" alt="Django">
  <img src="https://img.shields.io/badge/TypeScript-5.1-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-Ready-blue" alt="Docker">
</p>

## 🎯 Overview

MishMob (Mission Mobilization) is a community volunteer matching platform that connects skilled volunteers with meaningful opportunities using AI-powered matching. The platform enables individuals to quickly and effectively mobilize around local missions, unlocking human potential for both individual purpose and community service.

### Key Features
- 🤝 **Skills-Based Matching**: AI-powered matching of volunteer skills with opportunity requirements
- 📱 **Mobile-First**: Native mobile apps for iOS and Android with QR code check-in
- 🌍 **Location-Based Discovery**: Find opportunities near you
- 📊 **Impact Tracking**: Track volunteer hours and community impact
- 🎓 **Learning Paths**: Built-in training and skill development
- ⚡ **Real-Time Updates**: Push notifications and live event updates

## 🏗️ Architecture

The platform consists of three main components:

1. **Backend API** (`/backend`) - Django + Django Ninja REST API
2. **Web Application** (`/frontend`) - React + TypeScript web app
3. **Mobile Application** (`/mobile`) - React Native CLI with Metro bundler and native modules

All components share common TypeScript types (`/shared`) and are orchestrated using Docker Compose.

## 🚀 Quick Start

### Automated Setup (Recommended for macOS)

We provide scripts to automatically set up your development environment:

```bash
# Run the setup script to install all prerequisites
./setup.sh

# Verify your setup
./scripts/verify-setup.sh

# Start ALL services (Backend, Frontend, iOS, Android)
./start.sh

# Or start specific services
./scripts/quick-start.sh  # Backend and web only
./scripts/start-mobile.sh # Mobile only with menu
```

### Prerequisites

#### Required for All Development
- Docker and Docker Compose
- Node.js 20+ and npm
- Git

#### Additional for Mobile Development (macOS)
- **iOS Development**:
  - Xcode (latest version from App Store)
  - iOS Simulator (comes with Xcode)
  - CocoaPods: `sudo gem install cocoapods`
  
- **Android Development**:
  - Android Studio
  - Android SDK and Emulator
  - Java 11 or higher
  - Add to your `~/.zshrc` or `~/.bash_profile`:
    ```bash
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    export PATH=$PATH:$ANDROID_HOME/tools
    export PATH=$PATH:$ANDROID_HOME/tools/bin
    ```

- **React Native Tools**:
  - Watchman: `brew install watchman`
  - React Native CLI: `npm install -g @react-native-community/cli`

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mishmob.git
cd mishmob
```

### 2. Set Up Environment
```bash
# Copy the backend environment template
cp backend/.env.example backend/.env

# The frontend and mobile apps have default configs that work out of the box
```

### 3. Start All Services with Docker
```bash
# Start backend services (database, API, search engine)
docker-compose up -d db backend search redis

# Wait for database to be ready (first time only)
sleep 10

# Run database migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Start the web frontend
docker-compose up -d web
```

### 4. Start Mobile App (React Native CLI with Metro)

#### Prerequisites for Mobile Development on macOS
- **iOS**: Xcode (from App Store) with iOS Simulator and CocoaPods
- **Android**: Android Studio with Android Emulator configured
- **Both**: Node.js 20+, Watchman (`brew install watchman`), and React Native CLI

#### Quick Start with Makefile Commands
```bash
# Complete mobile setup (dependencies + iOS pods)
make mobile-setup

# Start iOS app (Metro + Simulator)
make mobile-ios

# Start Android app (Metro + Emulator)
make mobile-android

# Start Metro bundler only
make mobile

# Check development environment
make mobile-doctor
```

#### Manual Setup - iOS Development
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Install iOS dependencies (CocoaPods)
cd ios && pod install && cd ..

# Start Metro bundler
npm start -- --port=8082

# In another terminal, run iOS app
npm run ios

# Or specify a device
npx react-native run-ios --simulator="iPhone 15 Pro"

# List available simulators
xcrun simctl list devices
```

#### Manual Setup - Android Development
```bash
# First, ensure Android Emulator is running
# Open Android Studio > Tools > AVD Manager > Launch emulator

# Or launch from command line (if configured)
emulator -avd Pixel_7_Pro_API_34

# Navigate to mobile directory
cd mobile
npm install

# Start Metro bundler
npm start -- --port=8082

# In another terminal, run Android app
npm run android

# If emulator not detected, check with:
adb devices
```

#### Troubleshooting Mobile Setup
```bash
# For React Native issues
npx react-native doctor

# Clear caches (using Makefile)
make mobile-clear-cache

# Complete clean and reinstall
make mobile-clean
make mobile-setup

# Manual cache clearing
cd mobile
watchman watch-del-all
rm -rf node_modules
npm install
cd ios && rm -rf Pods && pod install && cd ..
npx react-native start --reset-cache

# Stop Metro bundler if needed
make mobile-metro-stop
```

## 🌐 Access Points

Once everything is running, you can access:

- **Web Application**: http://localhost:8081
- **Mobile Metro DevTools**: http://localhost:8082
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/docs
- **Django Admin**: http://localhost:8080/admin
- **Meilisearch Dashboard**: http://localhost:7701 (Master Key: `dev-master-key`)

## 📱 Mobile Development Tips

### iOS Simulator Shortcuts
- `Cmd + D` - Open developer menu
- `Cmd + R` - Reload the app
- `Cmd + Ctrl + Z` - Shake gesture (opens dev menu)
- `Cmd + Shift + H` - Home button
- `Cmd + K` - Toggle keyboard

### Android Emulator Shortcuts
- `Cmd + M` - Open developer menu (macOS)
- Double tap `R` - Reload (with dev menu open)
- `Cmd + Shift + R` - Restart packager
- Long press power button - Device options

### Testing on Physical Devices
1. Ensure computer and device are on the same network
2. Find your computer's IP address:
   ```bash
   # On macOS
   ipconfig getifaddr en0
   ```
3. Update the API URL in `mobile/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8080/api';
   ```
4. For iOS: Open in Xcode and run on connected device
5. For Android: Enable Developer Mode, USB debugging, and run:
   ```bash
   cd mobile && npx react-native run-android --deviceId=YOUR_DEVICE_ID
   ```

### Using Multiple Simulators
```bash
# iOS - Run on specific simulator
npx react-native run-ios --simulator="iPhone 15"
npx react-native run-ios --simulator="iPad Pro (12.9-inch)"

# Android - Run on all connected devices
npx react-native run-android --all
```

## 🛠️ Development Commands

### Backend
```bash
# Run tests
docker-compose exec backend pytest

# Make migrations
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell

# View logs
docker-compose logs -f backend
```

### Web Frontend
```bash
# Install new package
docker-compose exec web npm install <package-name>

# Run tests
docker-compose exec web npm test

# Build for production
docker-compose exec web npm run build
```

### Mobile App
```bash
# Install new package
cd mobile && npm install <package-name>

# Run tests
cd mobile && npm test

# Build iOS for production
make mobile-build-ios

# Build Android for production
make mobile-build-android

# View iOS logs
make mobile-logs-ios

# View Android logs
make mobile-logs-android

# Manual builds
cd mobile && npx react-native run-ios --configuration Release
cd mobile && npx react-native run-android --variant=release
```

## 🧪 Testing

### Create Test Data
```bash
# Run the seed command to create sample data
docker-compose exec backend python manage.py seed_data
```

### API Testing
Use the interactive API documentation at http://localhost:8000/api/docs

### Default Test Accounts
- Admin: `admin` / `admin123`
- Volunteer: `volunteer` / `test123`
- Host: `host` / `test123`

## 🐛 Troubleshooting

### Mobile App Can't Connect to Backend
1. Check that backend is running: `docker-compose ps`
2. For physical devices, use your computer's IP address instead of `localhost`
3. Check CORS settings in backend if getting CORS errors

### iOS Simulator Issues
```bash
# Reset Metro cache
make mobile-clear-cache

# Fix iOS simulator issues
make mobile-fix-ios

# Manual fixes
cd mobile && npx react-native start --reset-cache
cd mobile/ios && xcodebuild clean && cd ..
npx react-native run-ios

# Update iOS pods
cd mobile/ios && pod install --repo-update
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# View database logs
docker-compose logs db

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## 📚 Documentation

- [Getting Started Guide](GETTING_STARTED.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Development Status](DEVELOPMENT_STATUS.md)
- [AI Context Guide](CLAUDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ for community service
- Powered by open source technologies
- Designed for maximum social impact