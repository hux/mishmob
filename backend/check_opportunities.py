#!/usr/bin/env python
"""Check opportunities in database"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from opportunities.models import Opportunity
from events.models import Event, EventTicket
from django.contrib.auth import get_user_model

User = get_user_model()

# Check all opportunities
opps = Opportunity.objects.all()
print(f"Total opportunities: {opps.count()}")
for opp in opps:
    print(f"\n- {opp.title}")
    print(f"  Status: {opp.status}")
    print(f"  Featured: {opp.featured}")
    print(f"  Location: {opp.location_name}")
    print(f"  Date: {opp.start_date}")
    
    # Check if has event
    try:
        event = opp.event
        print(f"  Has event: Yes")
        print(f"  Tickets created: {event.tickets.count()}")
    except:
        print(f"  Has event: No")

# Mark some as featured
print("\n\nMarking opportunities as featured...")
for opp in opps[:2]:
    opp.featured = True
    opp.save()
    print(f"Marked {opp.title} as featured")

# Check featured
featured = Opportunity.objects.filter(featured=True)
print(f"\nFeatured opportunities: {featured.count()}")