import logging
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup

from .base import BaseCrawler
from .utils import (
    extract_skills_from_text, 
    parse_time_commitment,
    extract_cause_areas,
    clean_organization_name
)


logger = logging.getLogger(__name__)


class VolunteerMatchCrawler(BaseCrawler):
    """
    Crawler for VolunteerMatch.org
    
    Note: This crawler respects robots.txt and rate limits.
    It only accesses publicly available information.
    """
    
    def crawl(self) -> List[Dict[str, Any]]:
        """Crawl VolunteerMatch search results"""
        opportunities = []
        
        # Get search parameters from source config
        config = self.source.config or {}
        search_params = {
            'k': config.get('keywords', ''),  # Keywords
            'v': config.get('virtual', ''),   # Virtual opportunities
            'l': config.get('location', 'United States'),  # Location
            'r': config.get('radius', '20'),  # Radius in miles
            'p': 1,  # Page number
        }
        
        # Remove empty parameters
        search_params = {k: v for k, v in search_params.items() if v}
        
        base_search_url = urljoin(self.source.base_url, '/search/')
        page = 1
        
        while page <= min(self.source.max_pages_per_crawl, 10):  # Limit to 10 pages max
            search_params['p'] = page
            
            # Fetch search results page
            response = self.fetch_page(base_search_url, params=search_params)
            if not response:
                break
            
            soup = self.parse_html(response.text)
            
            # Find opportunity cards on the page
            opportunity_cards = soup.find_all('div', class_='search-result')
            
            if not opportunity_cards:
                # Try alternative selectors
                opportunity_cards = soup.find_all('div', {'data-test': 'opportunity-card'})
            
            if not opportunity_cards:
                logger.info(f"No opportunities found on page {page}")
                break
            
            # Parse each opportunity
            for card in opportunity_cards:
                try:
                    opp_data = self.parse_opportunity(card)
                    if opp_data:
                        opportunities.append(opp_data)
                except Exception as e:
                    logger.error(f"Error parsing opportunity: {e}")
                    continue
            
            # Check if there's a next page
            next_link = soup.find('a', {'aria-label': 'Next page'})
            if not next_link:
                break
            
            page += 1
            
            # Respect rate limiting
            if len(opportunities) >= 100:  # Safety limit
                logger.info("Reached safety limit of 100 opportunities")
                break
        
        logger.info(f"Crawled {page} pages, found {len(opportunities)} opportunities")
        return opportunities
    
    def parse_opportunity(self, card: BeautifulSoup) -> Optional[Dict[str, Any]]:
        """Parse a single opportunity card"""
        data = {}
        
        # Extract title and URL
        title_elem = card.find('h3') or card.find('h2', class_='opportunity-title')
        if not title_elem:
            return None
        
        title_link = title_elem.find('a')
        if title_link:
            data['title'] = self.clean_text(title_link.get_text())
            relative_url = title_link.get('href', '')
            data['source_url'] = urljoin(self.source.base_url, relative_url)
            
            # Extract ID from URL if possible
            url_parts = urlparse(relative_url)
            path_parts = url_parts.path.strip('/').split('/')
            if len(path_parts) > 0:
                data['external_id'] = path_parts[-1]
        else:
            data['title'] = self.clean_text(title_elem.get_text())
            data['source_url'] = ''
        
        # Extract organization name
        org_elem = card.find('div', class_='org-name') or card.find('span', class_='organization')
        if org_elem:
            data['organization_name'] = clean_organization_name(
                self.clean_text(org_elem.get_text())
            )
        
        # Extract description
        desc_elem = card.find('div', class_='description') or card.find('p', class_='opportunity-desc')
        if desc_elem:
            data['description'] = self.clean_text(desc_elem.get_text())
        
        # Extract location
        location_elem = card.find('div', class_='location') or card.find('span', class_='location-text')
        if location_elem:
            location_text = self.clean_text(location_elem.get_text())
            data['location_text'] = location_text
            
            # Check if it's virtual/remote
            if 'virtual' in location_text.lower() or 'remote' in location_text.lower():
                data['is_remote'] = True
            
            # Extract location parts
            location_parts = self.extract_location_parts(location_text)
            data.update(location_parts)
        
        # Extract date information
        date_elem = card.find('div', class_='date-info') or card.find('span', class_='dates')
        if date_elem:
            date_text = self.clean_text(date_elem.get_text())
            data['start_date_text'] = date_text
            
            # Check if ongoing
            if 'ongoing' in date_text.lower() or 'flexible' in date_text.lower():
                data['is_ongoing'] = True
        
        # Extract cause areas
        cause_elem = card.find('div', class_='causes') or card.find('span', class_='cause-area')
        if cause_elem:
            cause_text = self.clean_text(cause_elem.get_text())
            data['cause_areas_text'] = cause_text
            data['cause_areas'] = extract_cause_areas(cause_text)
        
        # If we need more details, fetch the opportunity page
        if data.get('source_url'):
            detail_data = self.fetch_opportunity_details(data['source_url'])
            if detail_data:
                data.update(detail_data)
        
        # Extract skills from description and requirements
        all_text = f"{data.get('description', '')} {data.get('skills_text', '')}"
        data['extracted_skills'] = extract_skills_from_text(all_text)
        
        return data
    
    def fetch_opportunity_details(self, url: str) -> Optional[Dict[str, Any]]:
        """Fetch additional details from the opportunity page"""
        response = self.fetch_page(url)
        if not response:
            return None
        
        soup = self.parse_html(response.text)
        data = {}
        
        # Extract detailed description
        desc_elem = soup.find('div', class_='opportunity-description')
        if desc_elem:
            data['description'] = self.clean_text(desc_elem.get_text())
        
        # Extract requirements/skills
        skills_section = soup.find('div', class_='skills-needed')
        if skills_section:
            data['skills_text'] = self.clean_text(skills_section.get_text())
        
        # Extract time commitment
        commitment_elem = soup.find('div', class_='time-commitment')
        if commitment_elem:
            commitment_text = self.clean_text(commitment_elem.get_text())
            data['time_commitment_text'] = commitment_text
            data['time_commitment_parsed'] = parse_time_commitment(commitment_text)
        
        # Extract organization website
        org_link = soup.find('a', class_='organization-website')
        if org_link:
            data['organization_url'] = org_link.get('href', '')
        
        # Extract impact statement if available
        impact_elem = soup.find('div', class_='impact-statement')
        if impact_elem:
            data['impact_text'] = self.clean_text(impact_elem.get_text())
        
        return data