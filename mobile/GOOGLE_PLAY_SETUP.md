# Google Play Store Deployment Setup

This guide walks you through setting up automated deployment to the Google Play Store for the MishMob mobile app.

## Quick Start

Once configured, you can deploy with a single command:

```bash
# Deploy to internal testing
make mobile-play-internal

# Deploy to alpha testing  
make mobile-play-alpha

# Deploy to beta testing
make mobile-play-beta

# Deploy to production
make mobile-play-production
```

## One-Time Setup

### 1. Install Dependencies

```bash
make mobile-play-setup
```

This installs fastlane and required gems.

### 2. Generate Release Keystore

```bash
make mobile-play-keystore
```

This creates an Android release keystore for signing your app. **Keep the keystore and passwords safe** - you'll need them for all future releases.

### 3. Google Play Console Setup

#### Create a Service Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Setup** → **API access**
3. Click **Create new service account**
4. Follow the link to Google Cloud Console
5. Create a new service account with these permissions:
   - Service Account User
   - Service Account Key Admin
6. Generate a JSON key file
7. Download and save as `mobile/fastlane/google-play-service-account.json`

#### Grant Permissions in Play Console

1. Back in Play Console, find your new service account
2. Grant these permissions:
   - **Release apps to testing tracks**
   - **Release apps to production** 
   - **View app information and download bulk reports**

#### Create Your App Listing

1. Create a new app in Google Play Console
2. Upload at least one APK/AAB manually to create the initial listing
3. Fill out the required store listing information
4. Note your app's package name (should be `com.mishmobmobile`)

### 4. Configure Environment Variables

Copy the environment template:

```bash
cp mobile/.env.example mobile/.env
```

Edit `mobile/.env` with your values:

```bash
# Android Signing Configuration
ANDROID_KEYSTORE_PATH=android/release.keystore
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=your_key_alias  
ANDROID_KEY_PASSWORD=your_key_password

# Google Play Console API Configuration
GOOGLE_PLAY_JSON_KEY_PATH=fastlane/google-play-service-account.json
```

**Important**: Never commit the `.env` file or keystore to git. They're already in `.gitignore`.

## Available Commands

### Building

```bash
# Clean build artifacts
make mobile-play-clean

# Build Android App Bundle (AAB) for Play Store
make mobile-play-build
```

### Deployment

```bash
# Deploy to different tracks
make mobile-play-internal    # Internal testing (max 100 users)
make mobile-play-alpha       # Alpha testing (up to 2000 users)
make mobile-play-beta        # Beta testing (unlimited users)
make mobile-play-production  # Production release

# Promote existing builds between tracks
make mobile-play-promote-alpha      # Internal → Alpha
make mobile-play-promote-beta       # Alpha → Beta  
make mobile-play-promote-production # Beta → Production
```

### Monitoring

```bash
# Check deployment status across all tracks
make mobile-play-status
```

## Testing Tracks Explained

- **Internal Testing**: Quick testing with up to 100 users. No review required.
- **Alpha Testing**: Testing with up to 2000 users. Minimal review.
- **Beta Testing**: Open or closed testing with unlimited users. Standard review.
- **Production**: Live on Google Play Store. Full review process.

## Troubleshooting

### Common Issues

**"Package not found" error:**
- Ensure you've created the app in Google Play Console
- Verify the package name matches `com.mishmobmobile`

**"Service account permissions" error:**
- Check that your service account has the required permissions
- Ensure the JSON key file path is correct

**"Keystore not found" error:**
- Run `make mobile-play-keystore` to generate a keystore
- Verify the keystore path in your `.env` file

**"Build failed" error:**
- Run `make mobile-play-clean` first
- Ensure you have the Android SDK installed
- Check that all environment variables are set

### Version Management

The app will automatically increment version codes. To manually set versions:

```bash
# In your .env file
APP_VERSION_NAME=1.0.0
APP_VERSION_CODE=1
```

### Security Best Practices

- **Never commit** keystores, `.env` files, or service account JSON to git
- Use different keystores for debug and release builds
- Rotate service account keys periodically
- Limit service account permissions to only what's needed

## Continuous Integration

To use in CI/CD (e.g., GitHub Actions):

```yaml
- name: Deploy to Play Store
  env:
    ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
    ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
    ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
    GOOGLE_PLAY_JSON_KEY_PATH: fastlane/google-play-service-account.json
  run: make mobile-play-internal
```

Store your keystore and service account JSON as base64-encoded secrets in your CI system.

## Support

If you encounter issues:

1. Check the fastlane logs in `mobile/fastlane/report.xml`
2. Verify your Google Play Console setup
3. Ensure all environment variables are correctly set
4. Try the manual process first to isolate automation issues

For more information, see:
- [Fastlane Android Documentation](https://docs.fastlane.tools/getting-started/android/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [React Native Publishing Guide](https://reactnative.dev/docs/signed-apk-android)