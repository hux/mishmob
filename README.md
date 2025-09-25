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
3. **Mobile Application** (`/mobile-cli`) - React Native CLI with native modules support
   - Alternative: (`/mobile`) - React Native + Expo (simpler setup)

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
  - React Native CLI: `npm install -g react-native-cli`

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

### 4. Start Mobile App (React Native)

#### Prerequisites for Mobile Development on macOS
- **iOS**: Xcode (from App Store) with iOS Simulator
- **Android**: Android Studio with Android Emulator configured
- **Both**: Node.js 20+ and Watchman (`brew install watchman`)

#### Option A: Using Expo (Recommended for Development)
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Then press:
# - 'i' for iOS Simulator
# - 'a' for Android Emulator
# - Scan QR code with Expo Go app on physical device
```

#### Option B: iOS Simulator (macOS only)
```bash
# First time setup
cd mobile
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Open iOS Simulator
open -a Simulator

# Run the app
npx react-native run-ios

# Or specify a device
npx react-native run-ios --simulator="iPhone 15 Pro"

# List available simulators
xcrun simctl list devices
```

#### Option C: Android Emulator (macOS)
```bash
# First, ensure Android Emulator is running
# Open Android Studio > Tools > AVD Manager > Launch emulator

# Or launch from command line (if configured)
emulator -avd Pixel_7_Pro_API_34

# Navigate to mobile directory
cd mobile
npm install

# Run the app
npx react-native run-android

# If emulator not detected, check with:
adb devices
```

#### Troubleshooting Mobile Setup
```bash
# For React Native issues
npx react-native doctor

# Clear caches
cd mobile
watchman watch-del-all
rm -rf node_modules
npm install
cd ios && rm -rf Pods && pod install && cd ..
npx react-native start --reset-cache
```

## 🌐 Access Points

Once everything is running, you can access:

- **Web Application**: http://localhost:5175
- **API Documentation**: http://localhost:8001/api/docs
- **Django Admin**: http://localhost:8001/admin
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
3. Update the API URL in `mobile/.env`:
   ```
   API_URL=http://YOUR_COMPUTER_IP:8000/api
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

# Build iOS
cd mobile && npx expo build:ios

# Build Android
cd mobile && npx expo build:android
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
cd mobile && npx react-native start --reset-cache

# Clean and rebuild
cd mobile/ios && xcodebuild clean && cd ..
npx react-native run-ios
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