#!/usr/bin/env python
"""
Test script to demonstrate web crawler functionality without database
"""

import sys
import os
import json
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock Django settings
class MockSettings:
    DEBUG = True

# Mock the Django settings module
sys.modules['django.conf'] = type(sys)('django.conf')
sys.modules['django.conf'].settings = MockSettings()

# Now we can import our crawler modules
from opportunities.crawlers.base import BaseCrawler
from opportunities.crawlers.generic import GenericNonprofitCrawler
from opportunities.crawlers.utils import extract_skills_from_text, parse_time_commitment, extract_cause_areas


class MockCrawlerSource:
    """Mock CrawlerSource for testing"""
    def __init__(self, name, base_url, crawler_class):
        self.name = name
        self.base_url = base_url
        self.crawler_class = crawler_class
        self.config = {}
        self.headers = {}
        self.rate_limit_delay_seconds = 0.5
        self.max_pages_per_crawl = 2
        self.is_active = True
        self.crawl_frequency_hours = 24
        self.last_crawl_time = None
        self.last_crawl_status = ''
        self.last_crawl_error = ''
        self.total_opportunities_found = 0
        self.total_opportunities_imported = 0
    
    def save(self):
        pass


class TestCrawler(BaseCrawler):
    """Test crawler that doesn't save to database"""
    
    def save_opportunities(self):
        """Override to prevent database saves"""
        print(f"\nFound {len(self.opportunities_found)} opportunities:")
        for i, opp in enumerate(self.opportunities_found, 1):
            print(f"\n--- Opportunity {i} ---")
            print(f"Title: {opp.get('title', 'N/A')}")
            print(f"Organization: {opp.get('organization_name', 'N/A')}")
            print(f"Description: {opp.get('description', 'N/A')[:200]}...")
            print(f"Location: {opp.get('location_text', 'N/A')}")
            print(f"Skills: {opp.get('skills_text', 'N/A')}")
            print(f"URL: {opp.get('source_url', 'N/A')}")
        
        self.stats['opportunities_found'] = len(self.opportunities_found)
        self.stats['opportunities_saved'] = 0  # Not saving to DB


def test_utility_functions():
    """Test the utility functions"""
    print("=== Testing Utility Functions ===\n")
    
    # Test skill extraction
    text = """
    We're looking for volunteers with Python and JavaScript experience to help 
    build our new website. Knowledge of React and Django is a plus. 
    Strong communication skills and project management experience preferred.
    """
    skills = extract_skills_from_text(text)
    print("Extracted skills:", skills)
    
    # Test time commitment parsing
    time_text = "10-15 hours per week for 3 months"
    time_parsed = parse_time_commitment(time_text)
    print(f"\nTime commitment '{time_text}':")
    print(f"  Parsed: {json.dumps(time_parsed, indent=2)}")
    
    # Test cause area extraction
    cause_text = """
    Join us in our environmental conservation efforts. We work to protect 
    wildlife and educate youth about sustainability.
    """
    causes = extract_cause_areas(cause_text)
    print(f"\nExtracted cause areas: {causes}")


def test_generic_crawler():
    """Test the generic nonprofit crawler"""
    print("\n\n=== Testing Generic Nonprofit Crawler ===\n")
    
    # Create a mock source
    source = MockCrawlerSource(
        name="Test Nonprofit",
        base_url="https://www.example.com",
        crawler_class="opportunities.crawlers.generic.GenericNonprofitCrawler"
    )
    
    # Create a test crawler that extends GenericNonprofitCrawler
    class TestGenericCrawler(GenericNonprofitCrawler, TestCrawler):
        def fetch_page(self, url, **kwargs):
            """Mock fetch_page to return sample HTML"""
            if url == self.source.base_url:
                # Return a mock response with volunteer page links
                class MockResponse:
                    status_code = 200
                    text = '''
                    <html>
                        <head><title>Test Nonprofit - Helping Our Community</title></head>
                        <body>
                            <nav>
                                <a href="/about">About Us</a>
                                <a href="/volunteer">Volunteer Opportunities</a>
                                <a href="/donate">Donate</a>
                            </nav>
                            <h1>Welcome to Test Nonprofit</h1>
                        </body>
                    </html>
                    '''
                return MockResponse()
            
            elif 'volunteer' in url:
                # Return a mock volunteer page
                class MockResponse:
                    status_code = 200
                    text = '''
                    <html>
                        <head><title>Volunteer Opportunities</title></head>
                        <body>
                            <h1>Volunteer With Us</h1>
                            <div class="opportunity">
                                <h3>Web Developer Volunteer</h3>
                                <p>Help us build a new website using React and Python. 
                                   This is a remote opportunity requiring 10 hours per week.</p>
                                <p class="location">Remote / San Francisco, CA</p>
                                <p class="time">10 hours/week for 3 months</p>
                            </div>
                            <div class="opportunity">
                                <h3>Event Planning Volunteer</h3>
                                <p>Assist with organizing our annual fundraising gala. 
                                   Need someone with event planning and marketing experience.</p>
                                <p class="location">San Francisco, CA 94102</p>
                                <p class="time">5-10 hours/week</p>
                            </div>
                        </body>
                    </html>
                    '''
                return MockResponse()
            
            return None
    
    # Run the crawler
    crawler = TestGenericCrawler(source)
    try:
        crawler.run()
        print(f"\nCrawler stats: {json.dumps(crawler.stats, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")


def test_simple_extraction():
    """Test simple data extraction from HTML"""
    print("\n\n=== Testing Simple HTML Extraction ===\n")
    
    from bs4 import BeautifulSoup
    
    html = '''
    <div class="volunteer-opportunity">
        <h2>Teaching Assistant for Youth Coding Program</h2>
        <p class="org">Code for Good Foundation</p>
        <p class="description">
            Help teach Python and web development to high school students. 
            We need patient mentors who can explain technical concepts clearly.
        </p>
        <ul class="details">
            <li>Location: Oakland, CA</li>
            <li>Time: Saturdays 10am-2pm</li>
            <li>Duration: 3 month commitment</li>
            <li>Skills needed: Python, JavaScript, Teaching</li>
        </ul>
    </div>
    '''
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract data
    title = soup.find('h2').get_text(strip=True)
    org = soup.find(class_='org').get_text(strip=True)
    desc = soup.find(class_='description').get_text(strip=True)
    
    print(f"Title: {title}")
    print(f"Organization: {org}")
    print(f"Description: {desc}")
    
    # Extract details
    print("\nDetails:")
    for detail in soup.find_all('li'):
        print(f"  - {detail.get_text(strip=True)}")
    
    # Extract skills
    skills = extract_skills_from_text(html)
    print(f"\nExtracted skills: {skills}")


if __name__ == "__main__":
    print("MishMob Web Crawler Test Script")
    print("=" * 50)
    
    # Test utility functions
    test_utility_functions()
    
    # Test simple extraction
    test_simple_extraction()
    
    # Test the generic crawler
    test_generic_crawler()
    
    print("\n\nTest completed!")
    print("\nNote: This is a demonstration. In production, the crawler would:")
    print("- Save opportunities to the database")
    print("- Fetch real web pages")
    print("- Respect robots.txt and rate limits")
    print("- Handle errors and retries")