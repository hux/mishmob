#!/usr/bin/env python
"""Test the fixed search functionality"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from opportunities.models import Opportunity

# Check if we have any opportunities with "test" in the title
test_opps = Opportunity.objects.filter(title__icontains='test')
print(f"Opportunities with 'test' in title: {test_opps.count()}")
for opp in test_opps:
    print(f"  - {opp.title} (ID: {opp.id}, Status: {opp.status})")

# Check all opportunities
all_opps = Opportunity.objects.all()
print(f"\nTotal opportunities in database: {all_opps.count()}")
for opp in all_opps[:5]:  # Show first 5
    print(f"  - {opp.title} (Status: {opp.status})")

# Test the search through the API view
print("\n--- Testing API Search ---")
from api.routers.opportunities import list_opportunities
from ninja.testing import TestClient

class MockRequest:
    def __init__(self):
        self.auth = None

# Test searching for "test"
print("\nSearching for 'test':")
request = MockRequest()
result = list_opportunities(request, skills="test", page=1, page_size=20)
print(f"Results found: {result.total}")
if result.results:
    for r in result.results[:3]:
        print(f"  - {r.title}")