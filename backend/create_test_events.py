#!/usr/bin/env python
"""
Create test events with check-in capability for testing the rotating barcode system.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
from opportunities.models import Opportunity, OpportunityHost
from events.models import Event, EventTicket, DeviceRegistration
from users.models import UserProfile
import uuid

User = get_user_model()


def create_test_events():
    """Create test events with check-in capability"""
    print("Creating test events with check-in capability...")
    
    # First, ensure we have a host user
    host_user, created = User.objects.get_or_create(
        username='eventhost',
        defaults={
            'email': 'host@mishmob.com',
            'first_name': 'Event',
            'last_name': 'Host',
            'user_type': 'Host',
            'is_active': True
        }
    )
    if created:
        host_user.set_password('hostpass123')
        host_user.save()
        print(f"✓ Created host user: {host_user.username}")
    
    # Create host profile
    host_profile, created = OpportunityHost.objects.get_or_create(
        user=host_user,
        defaults={
            'organization_name': 'Community Events Foundation',
            'organization_type': 'Non-profit',
            'website': 'https://communityevents.org',
            'description': 'We organize community events to bring people together',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94105',
            'is_verified': True,
            'verified_date': timezone.now().date()
        }
    )
    if created:
        print(f"✓ Created host profile: {host_profile.organization_name}")
    
    # Create test opportunities with events
    test_events_data = [
        {
            'title': 'Beach Cleanup Day - QR Check-in Test',
            'description': 'Join us for a community beach cleanup! Test your QR code check-in at this event.',
            'cause_area': 'environment',
            'start_date': timezone.now().date() + timedelta(days=2),
            'end_date': timezone.now().date() + timedelta(days=2),
            'location_name': 'Ocean Beach',
            'location_address': 'Ocean Beach, San Francisco, CA',
            'location_zip': '94122',
            'impact_statement': 'Help us clean up 2 miles of beach and protect marine life.',
            'time_commitment': '3 hours (9 AM - 12 PM)',
            'event_settings': {
                'max_attendees': 50,
                'check_in_opens_hours_before': 1,
                'check_in_closes_hours_after': 2,
                'require_device_registration': True,
                'qr_rotation_seconds': 60
            }
        },
        {
            'title': 'Food Bank Volunteer Orientation - Mobile Check-in',
            'description': 'New volunteer orientation with mobile QR code check-in system.',
            'cause_area': 'hunger',
            'start_date': timezone.now().date() + timedelta(days=5),
            'end_date': timezone.now().date() + timedelta(days=5),
            'location_name': 'SF-Marin Food Bank',
            'location_address': '900 Pennsylvania Ave, San Francisco, CA',
            'location_zip': '94107',
            'impact_statement': 'Learn how to help distribute food to 32,000 households weekly.',
            'time_commitment': '2 hours (10 AM - 12 PM)',
            'event_settings': {
                'max_attendees': 30,
                'check_in_opens_hours_before': 0.5,
                'check_in_closes_hours_after': 1,
                'require_device_registration': False,
                'qr_rotation_seconds': 30
            }
        },
        {
            'title': 'Senior Tech Help Session - Secure Check-in Demo',
            'description': 'Help seniors with technology while testing our secure event check-in system.',
            'cause_area': 'seniors',
            'start_date': timezone.now().date() + timedelta(days=7),
            'end_date': timezone.now().date() + timedelta(days=7),
            'location_name': 'Community Center',
            'location_address': '1800 Oakdale Ave, San Francisco, CA',
            'location_zip': '94124',
            'impact_statement': 'Bridge the digital divide by helping seniors navigate technology.',
            'time_commitment': '2 hours (2 PM - 4 PM)',
            'event_settings': {
                'max_attendees': 20,
                'check_in_opens_hours_before': 2,
                'check_in_closes_hours_after': 0.5,
                'require_device_registration': True,
                'qr_rotation_seconds': 45
            }
        }
    ]
    
    created_events = []
    
    for event_data in test_events_data:
        # Create opportunity
        opportunity, opp_created = Opportunity.objects.get_or_create(
            title=event_data['title'],
            host=host_profile,
            defaults={
                'description': event_data['description'],
                'cause_area': event_data['cause_area'],
                'start_date': event_data['start_date'],
                'end_date': event_data['end_date'],
                'location_name': event_data['location_name'],
                'location_address': event_data['location_address'],
                'location_zip': event_data['location_zip'],
                'impact_statement': event_data['impact_statement'],
                'time_commitment': event_data['time_commitment'],
                'status': 'open'
            }
        )
        
        if opp_created:
            print(f"✓ Created opportunity: {opportunity.title}")
            
            # Create associated event with check-in settings
            settings = event_data['event_settings']
            
            # Calculate check-in times based on event start time (9 AM for most events)
            event_start_datetime = datetime.combine(
                opportunity.start_date,
                datetime.strptime("09:00", "%H:%M").time()
            )
            event_start_datetime = timezone.make_aware(event_start_datetime)
            
            check_in_opens = event_start_datetime - timedelta(
                hours=settings['check_in_opens_hours_before']
            )
            check_in_closes = event_start_datetime + timedelta(
                hours=settings['check_in_closes_hours_after']
            )
            
            event = Event.objects.create(
                opportunity=opportunity,
                max_attendees=settings['max_attendees'],
                check_in_opens_at=check_in_opens,
                check_in_closes_at=check_in_closes,
                require_device_registration=settings['require_device_registration'],
                allow_multiple_devices=False,
                qr_rotation_seconds=settings['qr_rotation_seconds'],
                allow_early_check_in_minutes=30,
                allow_late_check_in_minutes=60
            )
            
            created_events.append(event)
            print(f"  → Added check-in capability (opens: {check_in_opens.strftime('%m/%d %I:%M %p')})")
    
    return created_events


def create_test_users_with_tickets(events):
    """Create verified test users and register them for events"""
    print("\nCreating verified test users with event tickets...")
    
    test_users_data = [
        {
            'username': 'volunteer1',
            'email': 'volunteer1@test.com',
            'password': 'testpass123',
            'first_name': 'Alice',
            'last_name': 'Johnson'
        },
        {
            'username': 'volunteer2',
            'email': 'volunteer2@test.com',
            'password': 'testpass123',
            'first_name': 'Bob',
            'last_name': 'Smith'
        },
        {
            'username': 'volunteer3',
            'email': 'volunteer3@test.com',
            'password': 'testpass123',
            'first_name': 'Carol',
            'last_name': 'Davis'
        }
    ]
    
    created_users = []
    
    for user_data in test_users_data:
        # Create user
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'user_type': 'Volunteer',
                'is_active': True
            }
        )
        
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"✓ Created user: {user.username} ({user.email})")
        
        # Create/update user profile and mark as verified
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'bio': f"Test volunteer profile for {user.first_name}"
            }
        )
        
        # Set zip code on user model
        if not user.zip_code:
            user.zip_code = '94105'
            user.save()
        
        if not profile.is_verified:
            profile.is_verified = True
            profile.verified_at = timezone.now()
            profile.save()
            print(f"  → Marked as verified")
        
        created_users.append(user)
        
        # Register user for first two events
        for event in events[:2]:
            ticket, ticket_created = EventTicket.objects.get_or_create(
                event=event,
                user=user,
                defaults={
                    'status': 'active'
                }
            )
            
            if ticket_created:
                print(f"  → Registered for: {event.opportunity.title}")
                
                # Create a device registration for first user on first event
                if user.username == 'volunteer1' and event == events[0]:
                    device = DeviceRegistration.objects.create(
                        user=user,
                        device_type='ios',
                        device_name='Alice\'s iPhone',
                        device_fingerprint_hash=f'test_device_hash_{user.id}_{uuid.uuid4().hex[:8]}',
                        is_trusted=True,
                        trust_established_at=timezone.now()
                    )
                    
                    ticket.registered_device = device
                    ticket.save()
                    print(f"    → Added trusted device: {device.device_name}")
    
    return created_users


def main():
    """Main function to create test data"""
    print("=" * 60)
    print("Setting up test events and users for QR code check-in")
    print("=" * 60)
    
    # Create events
    events = create_test_events()
    
    # Create users and register them
    users = create_test_users_with_tickets(events)
    
    print("\n" + "=" * 60)
    print("✅ Test data created successfully!")
    print("=" * 60)
    
    print("\nTest Users (all verified):")
    for user in users:
        print(f"  - {user.username} / testpass123")
    
    print(f"\nHost User:")
    print(f"  - eventhost / hostpass123")
    
    print("\nEvents with check-in enabled:")
    for event in events:
        print(f"  - {event.opportunity.title}")
        print(f"    Check-in opens: {event.check_in_opens_at.strftime('%m/%d %I:%M %p')}")
        print(f"    Max attendees: {event.max_attendees}")
        print(f"    QR rotation: {event.qr_rotation_seconds}s")
    
    print("\n📱 You can now test:")
    print("  1. Login as a volunteer to see event tickets")
    print("  2. Generate rotating QR codes for check-in")
    print("  3. Login as host to scan QR codes")
    print("  4. View check-in statistics and audit logs")


if __name__ == '__main__':
    main()