#!/usr/bin/env python
"""Test LMS API directly"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.test import RequestFactory
from api.routers.lms import list_courses
from lms.models import Course

# Check courses in database
courses = Course.objects.all()
print(f"Courses in database: {courses.count()}")
for course in courses:
    print(f"  - {course.title} (published: {course.is_published})")

# Test the API endpoint
print("\n--- Testing API endpoint ---")
factory = RequestFactory()
request = factory.get('/api/lms/courses')
request.auth = None  # Unauthenticated request

try:
    response = list_courses(request)
    print(f"Response type: {type(response)}")
    print(f"Response: {response}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()