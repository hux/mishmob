#!/usr/bin/env python
"""Check database contents"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from events.models import EventTicket, Event
from opportunities.models import Opportunity

User = get_user_model()

# Check database connection
with connection.cursor() as cursor:
    cursor.execute('SELECT current_database()')
    print(f'Connected to database: {cursor.fetchone()[0]}')
    
print('\n=== DATABASE CONTENTS ===')
print(f'Total users: {User.objects.count()}')
print(f'Total opportunities: {Opportunity.objects.count()}')
print(f'Total events: {Event.objects.count()}')
print(f'Total tickets: {EventTicket.objects.count()}')

# List all users
print('\n=== ALL USERS ===')
for user in User.objects.all():
    print(f'- {user.username} (ID: {user.id}, Email: {user.email})')

# Check testuser
print('\n=== TESTUSER CHECK ===')
try:
    user = User.objects.get(username='testuser')
    print(f'Testuser found:')
    print(f'  ID: {user.id}')
    print(f'  Email: {user.email}')
    
    tickets = EventTicket.objects.filter(user=user).select_related('event__opportunity')
    print(f'  Tickets: {tickets.count()}')
    for ticket in tickets:
        print(f'    - {ticket.event.opportunity.title} (ID: {ticket.id})')
        
except User.DoesNotExist:
    print('Testuser NOT FOUND!')

# Check opportunities
print('\n=== OPPORTUNITIES ===')
for opp in Opportunity.objects.all():
    print(f'- {opp.title} (Status: {opp.status}, Featured: {opp.featured})')
    try:
        event = opp.event
        print(f'  Has event: Yes (Tickets: {event.tickets.count()})')
    except:
        print(f'  Has event: No')