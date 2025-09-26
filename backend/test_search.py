#!/usr/bin/env python
"""Test search functionality for opportunities API"""
import requests
import json

# Base URL for API
BASE_URL = "http://localhost:8000/api"

# Test search parameters
test_cases = [
    {
        "name": "Search by skills (React)",
        "params": {"skills": "React"}
    },
    {
        "name": "Search by skills (Python, Django)",
        "params": {"skills": "Python,Django"}
    },
    {
        "name": "Search with zip code",
        "params": {"zip_code": "94105"}
    },
    {
        "name": "Search for remote opportunities only",
        "params": {"remote_only": "true"}
    },
    {
        "name": "Combined search (skills + remote)",
        "params": {"skills": "JavaScript", "remote_only": "true"}
    },
    {
        "name": "Search by cause area",
        "params": {"cause_area": "Education"}
    },
    {
        "name": "All filters combined",
        "params": {
            "skills": "React",
            "cause_area": "Technology",
            "remote_only": "true",
            "status": "open"
        }
    }
]

def test_opportunity_search():
    """Test opportunity search with various parameters"""
    print("Testing Opportunity Search API\n")
    print("=" * 60)
    
    for test in test_cases:
        print(f"\nTest: {test['name']}")
        print(f"Parameters: {test['params']}")
        print("-" * 40)
        
        try:
            # Make request
            response = requests.get(
                f"{BASE_URL}/opportunities/",
                params=test['params']
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Success! Found {data['total']} opportunities")
                print(f"  Page: {data['page']}/{data['page_size']}")
                
                # Show first result if any
                if data['results']:
                    first = data['results'][0]
                    print(f"  First result: {first['title']}")
                    print(f"    Organization: {first['organization']}")
                    print(f"    Skills: {', '.join(first['skills'][:3])}")
                    if 'match_score' in first and first['match_score']:
                        print(f"    Match Score: {first['match_score']}%")
            else:
                print(f"✗ Error: Status {response.status_code}")
                print(f"  Response: {response.text}")
                
        except Exception as e:
            print(f"✗ Exception: {e}")
    
    print("\n" + "=" * 60)
    print("Search testing complete!")

if __name__ == "__main__":
    test_opportunity_search()