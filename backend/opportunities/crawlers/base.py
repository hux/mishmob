import time
import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from django.utils import timezone
from django.db import transaction

from opportunities.models import CrawledOpportunity, CrawlerSource
from .utils import clean_description


logger = logging.getLogger(__name__)


class BaseCrawler(ABC):
    """Base class for all web crawlers"""
    
    def __init__(self, source: CrawlerSource):
        self.source = source
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MishMob/1.0 (volunteer-opportunities-crawler; contact@mishmob.org)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        # Add any custom headers from source config
        if self.source.headers:
            self.session.headers.update(self.source.headers)
        
        self.opportunities_found = []
        self.errors = []
        self.stats = {
            'pages_crawled': 0,
            'opportunities_found': 0,
            'opportunities_saved': 0,
            'duplicates_skipped': 0,
            'errors': 0,
        }
    
    @abstractmethod
    def crawl(self) -> List[Dict[str, Any]]:
        """
        Main crawl method to be implemented by subclasses.
        Should return a list of opportunity dictionaries.
        """
        pass
    
    @abstractmethod
    def parse_opportunity(self, item: Any) -> Optional[Dict[str, Any]]:
        """
        Parse a single opportunity item into standard format.
        Should return None if item cannot be parsed.
        """
        pass
    
    def run(self) -> Dict[str, Any]:
        """Execute the crawler and save results"""
        logger.info(f"Starting crawl for {self.source.name}")
        start_time = timezone.now()
        
        try:
            # Update crawl start time
            self.source.last_crawl_time = start_time
            self.source.save()
            
            # Run the actual crawl
            self.opportunities_found = self.crawl()
            
            # Save opportunities
            self.save_opportunities()
            
            # Update source statistics
            self.source.last_crawl_status = 'success'
            self.source.last_crawl_error = ''
            self.source.total_opportunities_found += self.stats['opportunities_found']
            
        except Exception as e:
            logger.error(f"Crawler error for {self.source.name}: {str(e)}")
            self.source.last_crawl_status = 'error'
            self.source.last_crawl_error = str(e)
            self.stats['errors'] += 1
            
        finally:
            self.source.save()
            
        logger.info(f"Crawl completed for {self.source.name}: {self.stats}")
        return self.stats
    
    def fetch_page(self, url: str, **kwargs) -> Optional[requests.Response]:
        """Fetch a page with rate limiting and error handling"""
        try:
            # Rate limiting
            time.sleep(float(self.source.rate_limit_delay_seconds))
            
            response = self.session.get(url, timeout=30, **kwargs)
            response.raise_for_status()
            
            self.stats['pages_crawled'] += 1
            return response
            
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            self.errors.append({'url': url, 'error': str(e)})
            self.stats['errors'] += 1
            return None
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content with BeautifulSoup"""
        return BeautifulSoup(html, 'lxml')
    
    def save_opportunities(self):
        """Save crawled opportunities to database"""
        for opp_data in self.opportunities_found:
            try:
                with transaction.atomic():
                    # Check for duplicates
                    if CrawledOpportunity.objects.filter(
                        source_url=opp_data.get('source_url')
                    ).exists():
                        self.stats['duplicates_skipped'] += 1
                        continue
                    
                    # Create CrawledOpportunity
                    crawled_opp = CrawledOpportunity(
                        source=self.source,
                        source_url=opp_data.get('source_url', ''),
                        external_id=opp_data.get('external_id', ''),
                        raw_data=opp_data,
                        title=self.clean_text(opp_data.get('title', '')),
                        organization_name=opp_data.get('organization_name', ''),
                        organization_url=opp_data.get('organization_url', ''),
                        description=clean_description(opp_data.get('description', '')),
                        location_text=opp_data.get('location_text', ''),
                        city=opp_data.get('city', ''),
                        state=opp_data.get('state', ''),
                        zip_code=opp_data.get('zip_code', ''),
                        is_remote=opp_data.get('is_remote', False),
                        start_date_text=opp_data.get('start_date_text', ''),
                        end_date_text=opp_data.get('end_date_text', ''),
                        parsed_start_date=opp_data.get('parsed_start_date'),
                        parsed_end_date=opp_data.get('parsed_end_date'),
                        is_ongoing=opp_data.get('is_ongoing', False),
                        time_commitment_text=opp_data.get('time_commitment_text', ''),
                        skills_text=opp_data.get('skills_text', ''),
                        cause_areas_text=opp_data.get('cause_areas_text', ''),
                    )
                    
                    # Calculate quality score
                    crawled_opp.calculate_quality_score()
                    
                    # Validate
                    validation_errors = self.validate_opportunity(crawled_opp)
                    if validation_errors:
                        crawled_opp.validation_errors = validation_errors
                    
                    crawled_opp.save()
                    self.stats['opportunities_saved'] += 1
                    
            except Exception as e:
                logger.error(f"Error saving opportunity: {str(e)}")
                self.stats['errors'] += 1
        
        self.stats['opportunities_found'] = len(self.opportunities_found)
    
    def validate_opportunity(self, opp: CrawledOpportunity) -> List[str]:
        """Validate opportunity data and return list of errors"""
        errors = []
        
        if not opp.title or len(opp.title) < 5:
            errors.append("Title is missing or too short")
        
        if not opp.organization_name:
            errors.append("Organization name is missing")
        
        if not opp.description or len(opp.description) < 50:
            errors.append("Description is missing or too short")
        
        if not opp.location_text and not opp.is_remote:
            errors.append("Location information is missing")
        
        return errors
    
    def extract_text(self, element, default=''):
        """Safely extract text from BeautifulSoup element"""
        if element:
            return element.get_text(strip=True)
        return default
    
    def extract_date(self, date_str: str) -> Optional[datetime]:
        """Try to parse date from string using common formats"""
        if not date_str:
            return None
        
        common_formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%m-%d-%Y',
            '%B %d, %Y',
            '%b %d, %Y',
            '%d %B %Y',
            '%d %b %Y',
        ]
        
        for fmt in common_formats:
            try:
                return datetime.strptime(date_str.strip(), fmt).date()
            except ValueError:
                continue
        
        return None
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ''
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special characters that might break parsing
        text = text.replace('\u0000', '')
        
        return text.strip()
    
    def extract_location_parts(self, location_str: str) -> Dict[str, str]:
        """Extract city, state, zip from location string"""
        parts = {
            'city': '',
            'state': '',
            'zip_code': '',
        }
        
        if not location_str:
            return parts
        
        # Common patterns:
        # "San Francisco, CA 94105"
        # "San Francisco, California"
        # "94105"
        
        # Try to extract zip code
        import re
        zip_match = re.search(r'\b(\d{5}(-\d{4})?)\b', location_str)
        if zip_match:
            parts['zip_code'] = zip_match.group(1)
            location_str = location_str.replace(zip_match.group(0), '').strip()
        
        # Try to split city and state
        if ',' in location_str:
            city_part, state_part = location_str.rsplit(',', 1)
            parts['city'] = city_part.strip()
            parts['state'] = state_part.strip()
        else:
            # Might just be a city or state
            parts['city'] = location_str.strip()
        
        return parts