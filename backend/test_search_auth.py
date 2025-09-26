#!/usr/bin/env python
"""Test search functionality with authentication"""
import requests
import json

# Base URL for API
BASE_URL = "http://localhost:8000/api"

# First, let's try to login to get a token
def get_auth_token():
    """Get authentication token"""
    login_data = {
        "username": "testuser",  # You'll need to adjust these
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token', data.get('token'))
        else:
            print(f"Login failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_opportunities_api():
    """Test opportunities API directly"""
    print("Testing Direct API Access\n")
    print("=" * 60)
    
    # Try without auth first
    print("\n1. Testing without authentication:")
    try:
        response = requests.get(f"{BASE_URL}/opportunities/")
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'Unknown')}")
        
        if 'application/json' in response.headers.get('content-type', ''):
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
        else:
            print(f"   Response (first 200 chars): {response.text[:200]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Try with different headers
    print("\n2. Testing with JSON headers:")
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    try:
        response = requests.get(f"{BASE_URL}/opportunities/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'Unknown')}")
        
        if 'application/json' in response.headers.get('content-type', ''):
            data = response.json()
            print(f"   Total opportunities: {data.get('total', 'Unknown')}")
        else:
            print(f"   Not JSON response")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Try the test endpoint
    print("\n3. Testing test endpoint:")
    try:
        response = requests.post(f"{BASE_URL}/opportunities/test")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_opportunities_api()