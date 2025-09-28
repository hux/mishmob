#!/usr/bin/env python
"""
Update existing test data to have open check-in windows
"""
import os
import sys
import django
from datetime import timedelta

# Add the backend directory to Python path
sys.path.append('/Users/b/Projects/mishmob/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.utils import timezone
from events.models import Event, EventTicket
from opportunities.models import Opportunity
from users.models import User

def update_check_in_windows():
    """Update existing events to have open check-in windows"""
    try:
        # Get the test user
        user = User.objects.get(username='testuser')
        print(f'Found user: {user}')
        
        # Get opportunities that should be events
        opportunities = Opportunity.objects.filter(status='open')[:4]
        print(f'Found {len(opportunities)} opportunities')
        
        if not opportunities:
            print('No opportunities found!')
            return
        
        now = timezone.now()
        
        # Set check-in windows to be very wide and definitely open
        # Opens 2 hours ago, closes 6 hours from now
        check_in_start = now - timedelta(hours=2)
        check_in_end = now + timedelta(hours=6)
        
        print(f'Setting all events to have check-in window:')
        print(f'  Opens: {check_in_start} (2 hours ago)')
        print(f'  Closes: {check_in_end} (6 hours from now)')
        print(f'  Current time: {now}')
        print()
        
        created_tickets = []
        
        for i, opp in enumerate(opportunities):
            # Delete and recreate event to ensure clean state
            try:
                existing_event = opp.event
                existing_event.delete()
                print(f'Deleted existing event for {opp.title}')
            except:
                pass
            
            # Create new event with wide open check-in window
            event = Event.objects.create(
                opportunity=opp,
                max_attendees=50,
                check_in_opens_at=check_in_start,
                check_in_closes_at=check_in_end,
                qr_rotation_seconds=30
            )
            print(f'Created new event for {opp.title}')
            
            print(f'  Check-in window: {event.check_in_opens_at} to {event.check_in_closes_at}')
            print(f'  Check-in open now? {event.is_check_in_open()}')
            
            # Delete any existing tickets for this user and create fresh one
            EventTicket.objects.filter(event=event, user=user).delete()
            
            # Create fresh ticket for test user
            ticket = EventTicket.objects.create(
                event=event,
                user=user,
                status='active'
            )
            
            # For the last ticket, mark it as already checked in
            if i == len(opportunities) - 1:
                ticket.checked_in_at = now - timedelta(minutes=5)
                ticket.save()
                print(f'Marked ticket as checked-in for {opp.title}')
            else:
                # Make sure it's not checked in
                ticket.checked_in_at = None
                ticket.save()
                print(f'Reset check-in status for {opp.title}')
            
            created_tickets.append({
                'title': opp.title,
                'ticket_id': str(ticket.id),
                'can_check_in': not ticket.checked_in_at and event.is_check_in_open(),
                'checked_in': bool(ticket.checked_in_at)
            })
        
        print(f'\n✅ Updated {len(created_tickets)} tickets:')
        for ticket_info in created_tickets:
            if ticket_info['checked_in']:
                status = "✅ Already checked-in"
            elif ticket_info['can_check_in']:
                status = "🎫 Ready for check-in"
            else:
                status = "❌ Cannot check-in"
            print(f'  - {ticket_info["title"]}: {status}')
        
        print('\n🎉 Test data updated successfully!')
        print('Now refresh your mobile app to see tickets with open check-in windows!')
        
    except Exception as e:
        print(f'❌ Error updating test data: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    update_check_in_windows()