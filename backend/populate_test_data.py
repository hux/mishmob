#!/usr/bin/env python
"""Populate database with test events and tickets"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
from opportunities.models import Opportunity, OpportunityHost
from events.models import Event, EventTicket
from users.models import UserProfile

User = get_user_model()

# Get or create a host user
host_user, created = User.objects.get_or_create(
    username='eventhost',
    defaults={
        'email': 'host@mishmob.com',
        'first_name': 'Event',
        'last_name': 'Host',
        'user_type': 'host',
        'is_verified': True,
        'zip_code': '10001'
    }
)

if created:
    host_user.set_password('hostpass123')
    host_user.save()
    UserProfile.objects.create(
        user=host_user,
        is_verified=True,
        bio='Test event host'
    )

# Create or get host organization
host_org, created = OpportunityHost.objects.get_or_create(
    user=host_user,
    defaults={
        'organization_name': 'NYC Community Services',
        'organization_type': 'nonprofit',
        'website': 'https://nyccommunity.org',
        'description': 'Helping build stronger NYC communities',
        'address_line1': '123 Main St',
        'city': 'New York',
        'state': 'NY',
        'zip_code': '10001',
        'is_verified': True
    }
)

print(f"Host organization: {host_org.organization_name}")

# Create opportunities with events
opportunities_data = [
    {
        'title': 'Central Park Cleanup Day',
        'description': 'Join us for a community cleanup event in Central Park. Help keep our parks beautiful!',
        'cause_area': 'environment',
        'location_name': 'Central Park West Entrance',
        'location_address': 'Central Park West & 72nd St, New York, NY 10023',
        'location_zip': '10023',
        'start_date': timezone.now() + timedelta(days=2),
        'end_date': timezone.now() + timedelta(days=2, hours=3),
        'time_commitment': '3 hours',
        'status': 'published',
        'is_remote': False,
        'has_event': True,
        'check_in_offset': timedelta(minutes=30)  # Check-in opens 30 min before
    },
    {
        'title': 'Food Bank Volunteer Weekend',
        'description': 'Help sort and pack food donations for families in need. All volunteers welcome!',
        'cause_area': 'hunger',
        'location_name': 'NYC Food Bank Warehouse',
        'location_address': '355 Food Center Dr, Bronx, NY 10474',
        'location_zip': '10474',
        'start_date': timezone.now() + timedelta(days=5),
        'end_date': timezone.now() + timedelta(days=5, hours=4),
        'time_commitment': '4 hours',
        'status': 'published',
        'is_remote': False,
        'has_event': True,
        'check_in_offset': timedelta(minutes=15)
    },
    {
        'title': 'Community Garden Planting',
        'description': 'Plant vegetables and flowers in our community garden. Great for families!',
        'cause_area': 'environment',
        'location_name': 'Brooklyn Community Garden',
        'location_address': '123 Garden St, Brooklyn, NY 11201',
        'location_zip': '11201',
        'start_date': timezone.now() + timedelta(days=7),
        'end_date': timezone.now() + timedelta(days=7, hours=2),
        'time_commitment': '2 hours',
        'status': 'published',
        'is_remote': False,
        'has_event': True,
        'check_in_offset': timedelta(minutes=20)
    },
    {
        'title': 'Tech Skills Workshop Helper',
        'description': 'Assist seniors learning basic computer skills. Patience and kindness required!',
        'cause_area': 'education',
        'location_name': 'Queens Public Library',
        'location_address': '89-11 Merrick Blvd, Jamaica, NY 11432',
        'location_zip': '11432',
        'start_date': timezone.now() + timedelta(days=1, hours=2),  # Tomorrow
        'end_date': timezone.now() + timedelta(days=1, hours=4),
        'time_commitment': '2 hours',
        'status': 'published',
        'is_remote': False,
        'has_event': True,
        'check_in_offset': timedelta(minutes=10)
    }
]

# Create opportunities and events
for opp_data in opportunities_data:
    check_in_offset = opp_data.pop('check_in_offset')
    has_event = opp_data.pop('has_event')
    
    opportunity, created = Opportunity.objects.get_or_create(
        title=opp_data['title'],
        host=host_org,
        defaults=opp_data
    )
    
    if created:
        print(f"Created opportunity: {opportunity.title}")
    else:
        print(f"Opportunity exists: {opportunity.title}")
    
    # Create event for this opportunity
    if has_event:
        event, created = Event.objects.get_or_create(
            opportunity=opportunity,
            defaults={
                'check_in_opens_at': opportunity.start_date - check_in_offset,
                'check_in_closes_at': opportunity.end_date + timedelta(hours=1),
                'require_device_registration': False,
                'max_attendees': 50,  # Default max attendees
                'qr_rotation_seconds': 30  # 30 seconds for testing
            }
        )
        
        if created:
            print(f"  - Created event with check-in from {event.check_in_opens_at} to {event.check_in_closes_at}")

# Create tickets for the test user
test_user = User.objects.get(username='testuser')
print(f"\nCreating tickets for user: {test_user.username}")

# Register test user for the first 3 events
events = Event.objects.all()[:3]
for event in events:
    ticket, created = EventTicket.objects.get_or_create(
        event=event,
        user=test_user,
        defaults={
            'status': 'active'
        }
    )
    
    if created:
        print(f"  - Registered for: {event.opportunity.title}")
        print(f"    Event date: {event.opportunity.start_date}")
        print(f"    Check-in opens: {event.check_in_opens_at}")
    else:
        print(f"  - Already registered for: {event.opportunity.title}")

# Also create a ticket that's already checked in
past_event = Event.objects.filter(opportunity__start_date__gte=timezone.now()).last()
if past_event:
    checked_ticket, created = EventTicket.objects.get_or_create(
        event=past_event,
        user=test_user,
        defaults={
            'status': 'active',
            'checked_in_at': timezone.now() - timedelta(hours=1),
            'checked_in_by': host_user
        }
    )
    if created:
        print(f"  - Created checked-in ticket for: {past_event.opportunity.title}")

print("\n✅ Test data created successfully!")
print("\nYou can now:")
print("1. Login as 'testuser' (password: testpass123)")
print("2. Go to 'My Tickets' to see your event tickets")
print("3. Tap on a ticket to view its dynamic QR code")
print("4. QR codes will refresh every 30 seconds")
print("\nHost login: 'eventhost' (password: hostpass123)")