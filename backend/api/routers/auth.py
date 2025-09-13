from ninja import Router
from ninja.responses import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
from django.conf import settings
from datetime import datetime, timedelta

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
    
    user = authenticate(username=data.username, password=data.password)
    
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
        user_type=user.user_type
    )


@router.post("/logout")
def logout_user(request):
    """Logout the current user"""
    logout(request)
    return {"message": "Successfully logged out"}


@router.get("/me", response=UserResponse)
def get_current_user(request):
    """Get current user details"""
    
    if not request.user.is_authenticated:
        return Response({"error": "Not authenticated"}, status=401)
    
    user = request.user
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        user_type=user.user_type,
        is_verified=user.is_verified,
        profile_picture=user.profile_picture.url if user.profile_picture else None,
        zip_code=user.zip_code
    )