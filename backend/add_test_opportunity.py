#!/usr/bin/env python
"""Add a test opportunity for search testing"""
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from opportunities.models import Opportunity, OpportunityHost, Role
from users.models import Skill, User

# Get or create a host
try:
    host_user = User.objects.filter(user_type='host').first()
    if host_user:
        host = host_user.host_profile
    else:
        # Create a test host if none exists
        host_user = User.objects.create_user(
            username='testhost',
            email='testhost@example.com',
            password='testpass123',
            user_type='host',
            first_name='Test',
            last_name='Host'
        )
        host = OpportunityHost.objects.create(
            user=host_user,
            organization_name='Test Organization',
            description='A test organization for development'
        )
except:
    host = OpportunityHost.objects.first()

if not host:
    print("No host found, please create a host user first")
    exit(1)

# Create test opportunity
opportunity = Opportunity.objects.create(
    host=host,
    title="Test Volunteer Opportunity",
    description="This is a test opportunity to verify search functionality. We need volunteers to help test our platform features.",
    cause_area="Technology",
    start_date=date.today() + timedelta(days=7),
    end_date=date.today() + timedelta(days=30),
    location_name="Test Location",
    location_address="123 Test Street",
    location_zip="94105",
    is_remote=True,
    impact_statement="Help us test and improve our volunteer matching platform",
    requirements="Basic computer skills",
    time_commitment="2-4 hours per week",
    status='open',
    featured=True
)

# Create a role for this opportunity
role = Role.objects.create(
    opportunity=opportunity,
    title="Platform Tester",
    description="Test various features of the platform",
    slots_available=5,
    time_commitment="Flexible"
)

print(f"Created test opportunity: {opportunity.title} (ID: {opportunity.id})")
print("You can now search for 'test' in the opportunities page")