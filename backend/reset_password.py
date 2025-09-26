#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from users.models import User

try:
    user = User.objects.get(username='testorg123')
    user.set_password('testpass123')
    user.save()
    print(f"Password reset successfully for user: {user.username}")
except User.DoesNotExist:
    print("User testorg123 does not exist")