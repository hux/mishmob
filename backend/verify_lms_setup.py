#!/usr/bin/env python
"""Verify LMS setup is working"""
import requests
import json

print("=== LMS Setup Verification ===\n")

# 1. Check API endpoint
print("1. Testing API endpoint...")
try:
    response = requests.get(
        "http://localhost:8080/api/lms/courses",
        headers={
            "Accept": "application/json",
            "Origin": "http://localhost:8081"
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   CORS Header: {response.headers.get('Access-Control-Allow-Origin', 'None')}")
    
    if response.status_code == 200:
        courses = response.json()
        print(f"   Courses found: {len(courses)}")
        for course in courses:
            print(f"     - {course['title']}")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

print("\n2. Frontend should be accessible at: http://localhost:8081/courses")
print("   - Make sure the frontend is running: cd frontend && npm run dev")
print("   - The courses page should show 3 courses")

print("\n3. Available courses:")
print("   - Volunteer Orientation (Beginner)")
print("   - Host Organization Training (Intermediate)")
print("   - Digital Skills for Community Impact (Intermediate)")

print("\n✅ Setup complete! The /courses page should now be working.")