"""
Temporary mock authentication for mobile app development
This bypasses the database issues while we fix the backend
"""
from ninja import Router
from ninja.responses import Response
from pydantic import BaseModel
from typing import Optional
from django.contrib.auth import get_user_model
from django.db import transaction
from users.models import UserProfile
import jwt
from django.conf import settings
from datetime import datetime, timedelta

User = get_user_model()
router = Router(tags=["Mock Authentication"])

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

# Mock users database
MOCK_USERS = {
    "testuser": {
        "password": "testpass123",
        "id": "mock-user-id-1",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "user_type": "volunteer",
        "is_verified": True,
        "zip_code": "10001"
    },
    "mobiletest": {
        "password": "mobile123",
        "id": "mock-user-id-2", 
        "email": "mobile@test.com",
        "first_name": "Mobile",
        "last_name": "Test",
        "user_type": "volunteer",
        "is_verified": False,
        "zip_code": "10002"
    }
}

@router.post("/login", response=TokenResponse)
def mock_login(request, data: LoginRequest):
    """Mock login endpoint for mobile development"""
    
    print(f"Mock login attempt for: {data.username}")
    
    user_data = MOCK_USERS.get(data.username)
    if not user_data or user_data["password"] != data.password:
        return Response({"error": "Invalid credentials"}, status=401)
    
    # Create or get the user from database
    with transaction.atomic():
        user, created = User.objects.get_or_create(
            username=data.username,
            defaults={
                'email': user_data["email"],
                'first_name': user_data["first_name"],
                'last_name': user_data["last_name"],
                'user_type': user_data["user_type"],
                'is_verified': user_data["is_verified"],
                'zip_code': user_data["zip_code"],
            }
        )
        
        if created:
            # Set password for the new user
            user.set_password(data.password)
            user.save()
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                is_verified=user_data["is_verified"],
                bio=f"Test user {data.username}"
            )
            print(f"Created new user in database: {data.username}")
        else:
            print(f"Retrieved existing user: {data.username}")
    
    # Generate a real JWT token
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    
    # Use a simple secret for mock auth (in production, use settings.SECRET_KEY)
    jwt_token = jwt.encode(payload, 'mock-secret-key', algorithm='HS256')
    
    return TokenResponse(
        access_token=jwt_token,
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        user_type=user.user_type
    )

@router.get("/me", response=UserResponse)
def mock_get_current_user(request):
    """Mock get current user endpoint"""
    
    # For development, return the first mock user
    user_data = MOCK_USERS["testuser"]
    
    return UserResponse(
        id=user_data["id"],
        username="testuser",
        email=user_data["email"],
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        user_type=user_data["user_type"],
        is_verified=user_data["is_verified"],
        zip_code=user_data["zip_code"]
    )

@router.post("/logout")
def mock_logout(request):
    """Mock logout endpoint"""
    return {"message": "Successfully logged out"}