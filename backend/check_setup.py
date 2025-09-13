#!/usr/bin/env python
"""Quick script to verify Django setup"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

print("✅ Django setup successful!")
print(f"Django version: {django.VERSION}")

# Check database connection
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("Make sure PostgreSQL is running and configured correctly.")

# List installed apps
from django.apps import apps
print("\n📦 Installed apps:")
for app in apps.get_app_configs():
    if not app.name.startswith('django.'):
        print(f"  - {app.name}")

print("\n🚀 Next steps:")
print("1. Run migrations: python manage.py makemigrations")
print("2. Apply migrations: python manage.py migrate")
print("3. Create superuser: python manage.py createsuperuser")
print("4. Run server: python manage.py runserver")