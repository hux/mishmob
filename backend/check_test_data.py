#!/usr/bin/env python
"""Check test events and users"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from events.models import Event, EventTicket
from django.contrib.auth import get_user_model

User = get_user_model()

print("\n=== EVENTS WITH CHECK-IN ===")
for event in Event.objects.all().select_related('opportunity'):
    print(f"\n📅 {event.opportunity.title}")
    print(f"   Date: {event.opportunity.start_date}")
    print(f"   Check-in opens: {event.check_in_opens_at.strftime('%m/%d %I:%M %p')}")
    print(f"   Check-in closes: {event.check_in_closes_at.strftime('%m/%d %I:%M %p')}")
    print(f"   Max attendees: {event.max_attendees}")
    print(f"   QR rotation: {event.qr_rotation_seconds}s")
    print(f"   Registered: {event.tickets.count()} people")

print("\n=== VOLUNTEER TEST USERS ===")
# Specifically look for our test volunteers
for username in ['volunteer1', 'volunteer2', 'volunteer3']:
    try:
        user = User.objects.get(username=username)
        tickets = EventTicket.objects.filter(user=user).select_related('event__opportunity')
        print(f"\n👤 {user.username} ({user.email}) - Password: testpass123")
        print(f"   Name: {user.get_full_name()}")
        print(f"   Verified: {'✓' if hasattr(user, 'profile') and user.profile.is_verified else '✗'}")
        if user.username == 'volunteer1':
            devices = user.devices.filter(is_active=True)
            if devices.exists():
                print(f"   Registered devices: {', '.join([d.device_name for d in devices])}")
        print(f"   Events registered for:")
        for ticket in tickets:
            status = "✓ Checked in" if ticket.checked_in_at else "Registered"
            print(f"   - {ticket.event.opportunity.title} ({status})")
    except User.DoesNotExist:
        pass

print("\n=== HOST USER ===")
try:
    host = User.objects.get(username='eventhost')
    print(f"👤 {host.username} ({host.email}) - Password: hostpass123")
    print(f"   Organization: {host.host_profile.organization_name if hasattr(host, 'host_profile') else 'N/A'}")
except User.DoesNotExist:
    print("Host user not found")