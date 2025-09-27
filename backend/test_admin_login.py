#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import authenticate
from django.test import Client
from django.contrib.sessions.models import Session

# Test authentication
print("=== Testing Authentication ===")
user = authenticate(username='admin', password='adminpass123')
if user:
    print(f"✓ Authentication successful for: {user.username}")
    print(f"  Is staff: {user.is_staff}")
    print(f"  Is active: {user.is_active}")
else:
    print("✗ Authentication failed")

# Test Django admin login via client
print("\n=== Testing Django Admin Login ===")
client = Client()

# Try to access admin
response = client.get('/admin/')
print(f"GET /admin/: {response.status_code} (should be 302 redirect to login)")

# Try to login
login_data = {
    'username': 'admin',
    'password': 'adminpass123',
    'next': '/admin/'
}
response = client.post('/admin/login/', login_data)
print(f"POST /admin/login/: {response.status_code}")

if response.status_code == 302:
    print("✓ Login successful - redirecting")
    print(f"  Redirect to: {response.get('Location')}")
else:
    print("✗ Login failed")
    # Check for error messages
    if hasattr(response, 'context') and response.context:
        if 'form' in response.context:
            print(f"  Form errors: {response.context['form'].errors}")
    
# Check sessions
print(f"\n=== Active Sessions ===")
print(f"Total sessions: {Session.objects.count()}")

# Check ALLOWED_HOSTS
from django.conf import settings
print(f"\n=== Django Settings ===")
print(f"DEBUG: {settings.DEBUG}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"CSRF_TRUSTED_ORIGINS: {getattr(settings, 'CSRF_TRUSTED_ORIGINS', 'Not set')}")
print(f"AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")