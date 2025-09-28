#!/usr/bin/env python
"""Fix opportunity status"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from opportunities.models import Opportunity

# Update all published opportunities to open
updated = Opportunity.objects.filter(status='published').update(status='open')
print(f"Updated {updated} opportunities from 'published' to 'open'")

# Check current status
opps = Opportunity.objects.all()
for opp in opps:
    print(f"- {opp.title}: {opp.status} (featured: {opp.featured})")