# Social Media Authentication Setup Guide

This guide explains how to configure Google, Apple, Facebook, and LinkedIn authentication for the MishMob platform.

## Overview

The MishMob platform supports four major social authentication providers:
- **Google OAuth2** - Most widely used, great for general user onboarding
- **Facebook Login** - Popular social network integration
- **Apple Sign In** - Required for iOS apps, privacy-focused
- **LinkedIn OAuth2** - Professional network, excellent for extracting work-related skills

## Quick Setup

1. **Install Dependencies** (already done in requirements.txt):
   ```bash
   pip install django-allauth cryptography
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Set up Social Providers**:
   ```bash
   python manage.py setup_social_providers
   ```

## Provider-Specific Setup

### 1. Google OAuth2 Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API for newer projects)

#### Step 2: Create OAuth2 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - Development: `http://localhost:8080/accounts/google/login/callback/`
   - Production: `https://yourdomain.com/accounts/google/login/callback/`

#### Step 3: Configure Environment Variables
```env
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret
```

### 2. Facebook Login Setup

#### Step 1: Create Facebook App
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** and follow the setup

#### Step 2: Add Facebook Login Product
1. In your app dashboard, click **+ Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform

#### Step 3: Configure OAuth Redirect URIs
1. Go to **Facebook Login** > **Settings**
2. Add Valid OAuth Redirect URIs:
   - Development: `http://localhost:8080/accounts/facebook/login/callback/`
   - Production: `https://yourdomain.com/accounts/facebook/login/callback/`

#### Step 4: Configure Environment Variables
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 3. Apple Sign In Setup

#### Step 1: Apple Developer Account Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple Developer account (required)

#### Step 2: Create App ID
1. Go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** > **App IDs**
3. Create a new App ID and enable **Sign In with Apple**

#### Step 3: Create Service ID
1. Go to **Identifiers** > **Services IDs**
2. Create a new Service ID
3. Enable **Sign In with Apple**
4. Configure domains and return URLs:
   - Development: `http://localhost:8080/accounts/apple/login/callback/`
   - Production: `https://yourdomain.com/accounts/apple/login/callback/`

#### Step 4: Create Private Key
1. Go to **Keys**
2. Create a new key and enable **Sign In with Apple**
3. Download the private key file (.p8)

#### Step 5: Configure Environment Variables
```env
APPLE_CLIENT_ID=your.apple.service.identifier
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_APPLE_PRIVATE_KEY\n-----END PRIVATE KEY-----
APPLE_KEY_ID=your-apple-key-id
APPLE_TEAM_ID=your-apple-team-id
```

### 4. LinkedIn OAuth2 Setup

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Click **Create app**
3. Fill in the required information

#### Step 2: Request Sign In with LinkedIn
1. In your app dashboard, go to **Auth** tab
2. Add authorized redirect URLs:
   - Development: `http://localhost:8080/accounts/linkedin_oauth2/login/callback/`
   - Production: `https://yourdomain.com/accounts/linkedin_oauth2/login/callback/`

#### Step 3: Configure Scopes
Request these scopes for basic profile information:
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address

#### Step 4: Configure Environment Variables
```env
LINKEDIN_OAUTH2_CLIENT_ID=your-linkedin-client-id
LINKEDIN_OAUTH2_CLIENT_SECRET=your-linkedin-client-secret
```

## API Endpoints

Once configured, the following API endpoints are available:

### Get Available Providers
```http
GET /api/auth/social/providers
```

### Get Authorization URL
```http
POST /api/auth/social/auth-url
Content-Type: application/json

{
    "provider": "google",
    "redirect_uri": "http://localhost:3000/auth/callback"
}
```

### Complete Social Authentication
```http
POST /api/auth/social/auth
Content-Type: application/json

{
    "provider": "google",
    "code": "authorization_code_from_provider",
    "redirect_uri": "http://localhost:3000/auth/callback"
}
```

### Get Connected Accounts
```http
GET /api/auth/social/connected
Authorization: Bearer your-jwt-token
```

### Disconnect Social Account
```http
POST /api/auth/social/disconnect/{provider}
Authorization: Bearer your-jwt-token
```

## Frontend Integration

### React/JavaScript Example

```javascript
// Get authorization URL
const getAuthUrl = async (provider) => {
    const response = await fetch('/api/auth/social/auth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: provider,
            redirect_uri: window.location.origin + '/auth/callback'
        })
    });
    const data = await response.json();
    return data.auth_url;
};

// Handle authentication callback
const handleAuthCallback = async (provider, code) => {
    const response = await fetch('/api/auth/social/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: provider,
            code: code,
            redirect_uri: window.location.origin + '/auth/callback'
        })
    });
    const data = await response.json();
    
    if (data.access_token) {
        // Store JWT token
        localStorage.setItem('access_token', data.access_token);
        // Redirect to dashboard or desired page
        window.location.href = '/dashboard';
    }
};
```

### React Native Example

```javascript
// Using expo-auth-session or similar
import * as AuthSession from 'expo-auth-session';

const socialLogin = async (provider) => {
    // Get auth URL from your API
    const authUrl = await getAuthUrl(provider);
    
    // Start auth session
    const result = await AuthSession.startAsync({ authUrl });
    
    if (result.type === 'success') {
        const { code } = result.params;
        // Complete authentication with your API
        await handleAuthCallback(provider, code);
    }
};
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for production OAuth callbacks
2. **State Parameter**: The state parameter is automatically handled for CSRF protection
3. **Token Storage**: Store JWT tokens securely (secure HTTP-only cookies or encrypted storage)
4. **Scope Limitations**: Only request necessary scopes from social providers
5. **Regular Key Rotation**: Rotate client secrets and private keys regularly

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**: Ensure callback URLs exactly match those configured in provider settings
2. **Missing Scopes**: Verify your app has the necessary permissions from the social provider
3. **Token Expiration**: Apple tokens expire quickly; handle this in your frontend
4. **Development vs Production**: Use different client credentials for different environments

### Debug Mode

Enable debug logging in Django settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'allauth': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Testing

Test each provider individually:
```bash
# Start development server
python manage.py runserver 8080

# Visit the authorization URLs directly in browser
http://localhost:8080/accounts/google/login/
http://localhost:8080/accounts/facebook/login/
http://localhost:8080/accounts/linkedin_oauth2/login/
http://localhost:8080/accounts/apple/login/
```

## Next Steps

1. **Skills Extraction**: Implement LinkedIn skills parsing in the social account adapter
2. **Profile Pictures**: Add profile picture downloading from social accounts
3. **Automatic Linking**: Enhance user linking logic for existing accounts
4. **Rate Limiting**: Add rate limiting to social auth endpoints
5. **Analytics**: Track social authentication usage and conversion rates

## Support

For additional help:
- Django Allauth Documentation: https://django-allauth.readthedocs.io/
- Provider-specific documentation linked above
- MishMob development team for platform-specific issues