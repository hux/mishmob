#!/usr/bin/env python
"""Add event tickets for test users"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Event, EventTicket, DeviceRegistration
from users.models import UserProfile
from django.utils import timezone
import uuid

User = get_user_model()

def add_tickets_for_test_users():
    """Create event tickets for our test volunteer users"""
    
    # Get all events
    events = list(Event.objects.all().select_related('opportunity'))
    
    if not events:
        print("No events found!")
        return
    
    print(f"Found {len(events)} events")
    
    # Get or create test volunteer users
    test_users = []
    for i in range(1, 4):
        user, created = User.objects.get_or_create(
            username=f'volunteer{i}',
            defaults={
                'email': f'volunteer{i}@test.com',
                'first_name': ['Alice', 'Bob', 'Carol'][i-1],
                'last_name': ['Johnson', 'Smith', 'Davis'][i-1],
                'user_type': 'volunteer',
                'zip_code': '94105',
                'is_active': True
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✓ Created user: {user.username}")
        
        # Ensure profile exists and is verified
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.is_verified:
            profile.is_verified = True
            profile.verified_at = timezone.now()
            profile.save()
            print(f"  → Marked {user.username} as verified")
        
        test_users.append(user)
    
    # Register each user for first two events
    for user in test_users:
        for event in events[:2]:  # First two events only
            ticket, created = EventTicket.objects.get_or_create(
                event=event,
                user=user,
                defaults={'status': 'active'}
            )
            
            if created:
                print(f"✓ Registered {user.username} for {event.opportunity.title}")
                
                # Add device for first user on first event (for testing device requirements)
                if user.username == 'volunteer1' and event == events[0]:
                    device, dev_created = DeviceRegistration.objects.get_or_create(
                        user=user,
                        device_fingerprint_hash=f'test_device_{user.id}_{uuid.uuid4().hex[:8]}',
                        defaults={
                            'device_type': 'ios',
                            'device_name': "Alice's Test iPhone",
                            'is_trusted': True,
                            'trust_established_at': timezone.now()
                        }
                    )
                    
                    ticket.registered_device = device
                    ticket.save()
                    
                    if dev_created:
                        print(f"  → Added device registration for {user.username}")

if __name__ == '__main__':
    print("Adding event tickets for test users...")
    add_tickets_for_test_users()
    
    # Show summary
    print("\n=== TICKET SUMMARY ===")
    for event in Event.objects.all():
        ticket_count = event.tickets.filter(status='active').count()
        print(f"{event.opportunity.title}: {ticket_count} tickets")