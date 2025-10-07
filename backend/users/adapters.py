from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from django.contrib.auth import get_user_model
from django.http import JsonResponse
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class AccountAdapter(DefaultAccountAdapter):
    """Custom account adapter for MishMob users"""
    
    def is_open_for_signup(self, request):
        """Allow user signup"""
        return True
    
    def save_user(self, request, user, form, commit=True):
        """Save additional user data during signup"""
        user = super().save_user(request, user, form, commit=False)
        
        # Set default user type to volunteer
        if not hasattr(user, 'user_type') or not user.user_type:
            user.user_type = 'volunteer'
        
        if commit:
            user.save()
        return user


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom social account adapter for MishMob users"""
    
    def is_open_for_signup(self, request, sociallogin):
        """Allow social account signup"""
        return True
    
    def pre_social_login(self, request, sociallogin):
        """Handle user linking before social login"""
        # Get user from social account if exists
        user = sociallogin.user
        if user.id:
            return
        
        # Try to link with existing user based on email
        if not user.email:
            return
        
        try:
            existing_user = User.objects.get(email=user.email)
            # Link the social account to existing user
            sociallogin.connect(request, existing_user)
            logger.info(f"Linked social account to existing user: {existing_user.email}")
        except User.DoesNotExist:
            # No existing user, proceed with normal flow
            pass
    
    def save_user(self, request, sociallogin, form=None):
        """Save user data from social account"""
        user = sociallogin.user
        
        # Set default user type for new social users
        if not user.pk:  # New user
            user.user_type = 'volunteer'
        
        # Extract additional data from social account
        social_account = sociallogin.account
        extra_data = social_account.extra_data
        
        # Update user fields based on provider
        if social_account.provider == 'google':
            self._update_from_google(user, extra_data)
        elif social_account.provider == 'facebook':
            self._update_from_facebook(user, extra_data)
        elif social_account.provider == 'linkedin_oauth2':
            self._update_from_linkedin(user, extra_data)
        elif social_account.provider == 'apple':
            self._update_from_apple(user, extra_data)
        
        user.save()
        
        # Create or update user profile
        self._create_or_update_profile(user, social_account, extra_data)
        
        return user
    
    def _update_from_google(self, user, extra_data):
        """Update user from Google data"""
        if not user.first_name and extra_data.get('given_name'):
            user.first_name = extra_data['given_name']
        if not user.last_name and extra_data.get('family_name'):
            user.last_name = extra_data['family_name']
    
    def _update_from_facebook(self, user, extra_data):
        """Update user from Facebook data"""
        if not user.first_name and extra_data.get('first_name'):
            user.first_name = extra_data['first_name']
        if not user.last_name and extra_data.get('last_name'):
            user.last_name = extra_data['last_name']
    
    def _update_from_linkedin(self, user, extra_data):
        """Update user from LinkedIn data"""
        if not user.first_name and extra_data.get('localizedFirstName'):
            user.first_name = extra_data['localizedFirstName']
        if not user.last_name and extra_data.get('localizedLastName'):
            user.last_name = extra_data['localizedLastName']
    
    def _update_from_apple(self, user, extra_data):
        """Update user from Apple data"""
        # Apple provides limited data
        if extra_data.get('name'):
            name_data = extra_data['name']
            if not user.first_name and name_data.get('firstName'):
                user.first_name = name_data['firstName']
            if not user.last_name and name_data.get('lastName'):
                user.last_name = name_data['lastName']
    
    def _create_or_update_profile(self, user, social_account, extra_data):
        """Create or update user profile with social data"""
        from users.models import UserProfile
        
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update profile with social data
        if social_account.provider == 'linkedin_oauth2':
            # LinkedIn specific profile updates
            if extra_data.get('publicProfileUrl'):
                profile.linkedin_url = extra_data['publicProfileUrl']
            
            # TODO: Extract skills from LinkedIn API if available
            # This would require additional LinkedIn API calls with proper permissions
        
        # Update profile picture if not set
        if not profile.user.profile_picture and extra_data.get('picture'):
            # TODO: Download and save profile picture
            pass
        
        profile.save()
    
    def populate_username(self, request, user):
        """Generate username for social users"""
        from allauth.account.utils import user_email, user_field
        from allauth.utils import generate_unique_username
        
        first_name = user_field(user, 'first_name')
        last_name = user_field(user, 'last_name') 
        email = user_email(user)
        username = None
        
        if first_name and last_name:
            username = f"{first_name.lower()}.{last_name.lower()}"
        elif first_name:
            username = first_name.lower()
        elif email:
            username = email.split('@')[0]
        
        if username:
            username = generate_unique_username([username, first_name, last_name, email, 'user'])
        
        user_field(user, 'username', username)
    
    def authentication_error(self, request, provider_id, error=None, exception=None, extra_context=None):
        """Handle authentication errors"""
        logger.error(f"Social authentication error for {provider_id}: {error}")
        
        # For API requests, return JSON error
        if request.path.startswith('/api/'):
            error_data = {
                'error': 'social_auth_failed',
                'provider': provider_id,
                'message': 'Social authentication failed. Please try again.'
            }
            raise ImmediateHttpResponse(JsonResponse(error_data, status=400))
        
        # For web requests, use default behavior
        return super().authentication_error(request, provider_id, error, exception, extra_context)