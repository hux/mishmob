from ninja import Router
from ninja.responses import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.urls import reverse
from django.http import JsonResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from api.auth import jwt_auth
from allauth.socialaccount.models import SocialApp, SocialAccount
from allauth.socialaccount.helpers import complete_social_login
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.linkedin_oauth2.views import LinkedInOAuth2Adapter
from allauth.socialaccount.providers.apple.views import AppleOAuth2Adapter
from allauth.socialaccount import app_settings
from allauth.socialaccount.adapter import get_adapter
import requests
import logging

User = get_user_model()
router = Router(tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    user_type: str = "volunteer"
    zip_code: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str
    user_type: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    user_type: str
    is_verified: bool
    profile_picture: Optional[str] = None
    zip_code: Optional[str] = None
    organization_id: Optional[int] = None


def generate_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


@router.post("/register", response=UserResponse)
def register(request, data: RegisterRequest):
    """Create a new user account"""
    
    # Check if username or email already exists
    if User.objects.filter(username=data.username).exists():
        return Response({"error": "Username already exists"}, status=400)
    
    if User.objects.filter(email=data.email).exists():
        return Response({"error": "Email already exists"}, status=400)
    
    # Create user
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        user_type=data.user_type,
        zip_code=data.zip_code
    )
    
    # Create user profile
    from users.models import UserProfile
    UserProfile.objects.create(user=user)
    
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        user_type=user.user_type,
        is_verified=user.is_verified,
        zip_code=user.zip_code
    )


@router.post("/login", response=TokenResponse)
def login_user(request, data: LoginRequest):
    """Login and receive JWT token"""
    
    print(f"Login attempt for username: {data.username}")
    
    # Check if user exists
    try:
        existing_user = User.objects.get(username=data.username)
        print(f"User found: {existing_user.username}, email: {existing_user.email}")
    except User.DoesNotExist:
        print(f"User not found: {data.username}")
        return Response({"error": "Invalid credentials"}, status=401)
    
    user = authenticate(username=data.username, password=data.password)
    print(f"Authentication result: {user}")
    
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)
    
    # Generate JWT token
    token = generate_token(user)
    
    # Also login the user for session-based auth
    login(request, user)
    
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        user_type=getattr(user, 'user_type', 'volunteer')
    )


@router.post("/logout")
def logout_user(request):
    """Logout the current user"""
    logout(request)
    return {"message": "Successfully logged out"}


@router.get("/me", response=UserResponse, auth=jwt_auth)
def get_current_user(request):
    """Get current user details"""
    
    user = request.auth  # The authenticated user from JWT
    
    # Get organization ID if user is a host
    organization_id = None
    if user.user_type.lower() == 'host':
        try:
            organization_id = user.host_profile.id
        except:
            pass
    
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        user_type=user.user_type,
        is_verified=user.is_verified,
        profile_picture=user.profile_picture.url if user.profile_picture else None,
        zip_code=user.zip_code,
        organization_id=organization_id
    )


class HostProfileRequest(BaseModel):
    organization_name: str
    organization_type: Optional[str] = None
    website: Optional[str] = None
    description: str
    address_line1: str
    city: str
    state: str
    zip_code: str


@router.post("/host-profile", auth=jwt_auth)
def create_or_update_host_profile(request, data: HostProfileRequest):
    """Create or update host organization profile"""
    
    user = request.auth
    
    if user.user_type != 'host':
        return Response({"error": "Only host users can create organization profiles"}, status=403)
    
    from opportunities.models import OpportunityHost
    
    host_profile, created = OpportunityHost.objects.update_or_create(
        user=user,
        defaults={
            'organization_name': data.organization_name,
            'organization_type': data.organization_type or '',
            'website': data.website or '',
            'description': data.description,
            'address_line1': data.address_line1,
            'city': data.city,
            'state': data.state,
            'zip_code': data.zip_code,
        }
    )
    
    return {
        "message": "Host profile created successfully" if created else "Host profile updated successfully",
        "organization_id": host_profile.id,
        "organization_name": host_profile.organization_name
    }


# Social Authentication Models
class SocialAuthRequest(BaseModel):
    provider: str
    code: str
    redirect_uri: Optional[str] = None
    state: Optional[str] = None


class SocialAuthURLRequest(BaseModel):
    provider: str
    redirect_uri: str


class SocialAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str
    user_type: str
    is_new_user: bool
    social_account_id: str


class ProviderURLResponse(BaseModel):
    auth_url: str
    state: Optional[str] = None


logger = logging.getLogger(__name__)


@router.post("/social/auth-url", response=ProviderURLResponse)
def get_social_auth_url(request, data: SocialAuthURLRequest):
    """Get authorization URL for social provider"""
    
    try:
        # Get the social app for the provider
        social_app = SocialApp.objects.get(provider=data.provider)
    except SocialApp.DoesNotExist:
        return Response({"error": f"Social provider {data.provider} not configured"}, status=400)
    
    # Get the appropriate adapter
    adapter_map = {
        'google': GoogleOAuth2Adapter,
        'facebook': FacebookOAuth2Adapter,
        'linkedin_oauth2': LinkedInOAuth2Adapter,
        'apple': AppleOAuth2Adapter,
    }
    
    if data.provider not in adapter_map:
        return Response({"error": f"Unsupported provider: {data.provider}"}, status=400)
    
    adapter_class = adapter_map[data.provider]
    adapter = adapter_class(request)
    
    # Generate the authorization URL
    try:
        provider = adapter.get_provider()
        auth_url = provider.get_auth_url(request, action='authenticate')
        
        # Add redirect_uri to the auth_url if needed
        if data.redirect_uri and '?' in auth_url:
            auth_url += f"&redirect_uri={data.redirect_uri}"
        elif data.redirect_uri:
            auth_url += f"?redirect_uri={data.redirect_uri}"
        
        return ProviderURLResponse(auth_url=auth_url)
        
    except Exception as e:
        logger.error(f"Error generating auth URL for {data.provider}: {str(e)}")
        return Response({"error": "Failed to generate authorization URL"}, status=500)


@router.post("/social/auth", response=SocialAuthResponse)
def social_auth_callback(request, data: SocialAuthRequest):
    """Handle social authentication callback with authorization code"""
    
    try:
        # Get the social app for the provider
        social_app = SocialApp.objects.get(provider=data.provider)
    except SocialApp.DoesNotExist:
        return Response({"error": f"Social provider {data.provider} not configured"}, status=400)
    
    # Get the appropriate adapter
    adapter_map = {
        'google': GoogleOAuth2Adapter,
        'facebook': FacebookOAuth2Adapter,
        'linkedin_oauth2': LinkedInOAuth2Adapter,
        'apple': AppleOAuth2Adapter,
    }
    
    if data.provider not in adapter_map:
        return Response({"error": f"Unsupported provider: {data.provider}"}, status=400)
    
    try:
        adapter_class = adapter_map[data.provider]
        adapter = adapter_class(request)
        
        # Exchange authorization code for access token
        app = adapter.get_provider().get_app(request)
        token = adapter.parse_token({'code': data.code})
        token.app = app
        
        # Get user info from the provider
        login_data = adapter.complete_login(request, app, token, response={'code': data.code})
        
        # Check if this is a new user
        is_new_user = not login_data.user.pk
        
        # Complete the social login
        login_data.state = {'process': 'login'}
        ret = complete_social_login(request, login_data)
        
        # Get the user (now saved)
        user = login_data.user
        
        # Get the social account
        social_account = SocialAccount.objects.get(
            user=user,
            provider=data.provider
        )
        
        # Generate JWT token
        jwt_token = generate_token(user)
        
        return SocialAuthResponse(
            access_token=jwt_token,
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            user_type=user.user_type,
            is_new_user=is_new_user,
            social_account_id=str(social_account.id)
        )
        
    except Exception as e:
        logger.error(f"Social authentication error for {data.provider}: {str(e)}")
        return Response({
            "error": "Social authentication failed", 
            "details": str(e)
        }, status=400)


@router.get("/social/providers")
def get_configured_providers(request):
    """Get list of configured social authentication providers"""
    
    providers = []
    social_apps = SocialApp.objects.all()
    
    for app in social_apps:
        provider_info = {
            "provider": app.provider,
            "name": app.name,
            "client_id": app.client_id,  # Safe to expose client ID
            "configured": True
        }
        providers.append(provider_info)
    
    return {"providers": providers}


@router.post("/social/disconnect/{provider}", auth=jwt_auth)
def disconnect_social_account(request, provider: str):
    """Disconnect a social account from the user"""
    
    user = request.auth
    
    try:
        social_account = SocialAccount.objects.get(user=user, provider=provider)
        social_account.delete()
        
        return {"message": f"Successfully disconnected {provider} account"}
        
    except SocialAccount.DoesNotExist:
        return Response({"error": f"No {provider} account connected"}, status=404)
    except Exception as e:
        logger.error(f"Error disconnecting {provider} account: {str(e)}")
        return Response({"error": "Failed to disconnect social account"}, status=500)


@router.get("/social/connected", auth=jwt_auth)
def get_connected_social_accounts(request):
    """Get list of social accounts connected to the user"""
    
    user = request.auth
    social_accounts = SocialAccount.objects.filter(user=user)
    
    connected = []
    for account in social_accounts:
        account_info = {
            "provider": account.provider,
            "uid": account.uid,
            "date_joined": account.date_joined.isoformat(),
            "extra_data": {
                "name": account.extra_data.get('name', ''),
                "email": account.extra_data.get('email', ''),
                "picture": account.extra_data.get('picture', ''),
            }
        }
        connected.append(account_info)
    
    return {"connected_accounts": connected}