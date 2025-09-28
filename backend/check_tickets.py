#!/usr/bin/env python
"""Check user tickets"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import EventTicket

User = get_user_model()

# Check testuser tickets
user = User.objects.get(username='testuser')
tickets = EventTicket.objects.filter(user=user).select_related('event__opportunity')

print(f"User {user.username} has {tickets.count()} tickets:")
for ticket in tickets:
    print(f"  - {ticket.event.opportunity.title}")
    print(f"    Status: {ticket.status}")
    print(f"    Event date: {ticket.event.opportunity.start_date}")
    print(f"    Check-in opens: {ticket.event.check_in_opens_at}")
    print(f"    Is checked in: {ticket.is_checked_in}")
    print(f"    Ticket ID: {ticket.id}")
    print()