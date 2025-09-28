#!/usr/bin/env python
"""Create a test user for development"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()

# Create test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={
        'email': 'test@mishmob.com',
        'first_name': 'Test',
        'last_name': 'User',
        'user_type': 'volunteer',
        'is_verified': True,
        'zip_code': '10001'
    }
)

if created:
    user.set_password('testpass123')
    user.save()
    
    # Create user profile
    UserProfile.objects.create(
        user=user,
        is_verified=True,
        bio='Test volunteer user'
    )
    print(f"Created test user: {user.username}")
else:
    print(f"User already exists: {user.username}")

# Print user details
print(f"Username: {user.username}")
print(f"Email: {user.email}")
print(f"User Type: {user.user_type}")
print(f"Is Verified: {user.is_verified}")
print(f"Password: testpass123")