#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from users.models import User
from opportunities.models import OpportunityHost

user = User.objects.get(username='testorg123')
host_profile, created = OpportunityHost.objects.get_or_create(
    user=user,
    defaults={
        'organization_name': 'Test Organization',
        'organization_type': 'nonprofit',
        'website': 'https://testorg.com',
        'description': 'A test organization for development',
        'address_line1': '123 Test Street',
        'city': 'Portland',
        'state': 'OR',
        'zip_code': '97201',
        'is_verified': True,
        'rating_average': 4.5,
        'rating_count': 10
    }
)
print(f"Host profile {'created' if created else 'already exists'} for {user.username}")