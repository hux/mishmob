from ninja.security import HttpBearer
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            # Try with the real secret key first
            try:
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=['HS256']
                )
            except jwt.InvalidTokenError:
                # Try with mock secret key as fallback
                payload = jwt.decode(
                    token,
                    'mock-secret-key',
                    algorithms=['HS256']
                )
            
            # Check if token is expired
            exp = payload.get('exp')
            if exp and datetime.utcnow().timestamp() > exp:
                return None
                
            # Get user
            user_id = payload.get('user_id')
            if not user_id:
                return None
                
            try:
                user = User.objects.get(id=user_id)
                request.user = user
                return user
            except User.DoesNotExist:
                return None
                
        except (jwt.InvalidTokenError, jwt.DecodeError):
            return None


# Create a global instance
jwt_auth = JWTAuth()


# Optional auth that doesn't require authentication but sets user if token is present
class OptionalJWTAuth(HttpBearer):
    def authenticate(self, request, token):
        if not token:
            request.user = None
            return True  # Allow access without token
            
        # Try to authenticate with token
        auth = JWTAuth()
        user = auth.authenticate(request, token)
        request.user = user
        return True  # Allow access regardless

optional_jwt_auth = OptionalJWTAuth()