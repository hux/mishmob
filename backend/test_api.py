#!/usr/bin/env python
"""Test API endpoints"""

import requests
import json

# Base URL
BASE_URL = "http://localhost:8080/api"

# Login to get token
print("1. Logging in...")
login_response = requests.post(f"{BASE_URL}/auth/login", json={
    "username": "testuser",
    "password": "testpass123"
})

print(f"Login status: {login_response.status_code}")
print(f"Login response: {login_response.text}")

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f"Got token: {token[:20]}...")
    
    # Get tickets
    print("\n2. Fetching tickets...")
    headers = {"Authorization": f"Bearer {token}"}
    tickets_response = requests.get(f"{BASE_URL}/events/my-tickets", headers=headers)
    
    print(f"Tickets status: {tickets_response.status_code}")
    print(f"Tickets response: {json.dumps(tickets_response.json(), indent=2)}")
else:
    print("Login failed!")