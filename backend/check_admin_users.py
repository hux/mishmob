#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("\n=== CHECKING ADMIN USERS ===")
print("\nStaff/Admin users:")
for user in User.objects.filter(is_staff=True):
    print(f"Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Is Staff: {user.is_staff}")
    print(f"  Is Superuser: {user.is_superuser}")
    print(f"  User Type: {user.user_type}")
    print()

print("\n=== TESTING AUTHENTICATION ===")
from django.contrib.auth import authenticate

# Test admin user
admin_auth = authenticate(username='admin', password='adminpass123')
print(f"admin/adminpass123: {'✓ SUCCESS' if admin_auth else '✗ FAILED'}")

# Test eventhost user  
host_auth = authenticate(username='eventhost', password='hostpass123')
print(f"eventhost/hostpass123: {'✓ SUCCESS' if host_auth else '✗ FAILED'}")

print("\n=== CHECKING CUSTOM USER MODEL ===")
print(f"AUTH_USER_MODEL: {User._meta.label}")
print(f"User model table: {User._meta.db_table}")