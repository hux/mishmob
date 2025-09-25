import logging
import re
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from .base import BaseCrawler
from .utils import (
    extract_skills_from_text,
    parse_time_commitment,
    extract_cause_areas,
    clean_organization_name,
    parse_contact_info,
    normalize_url,
    clean_description,
    extract_volunteer_events
)


logger = logging.getLogger(__name__)


class GenericNonprofitCrawler(BaseCrawler):
    """
    Generic crawler for individual nonprofit websites.
    Uses heuristics to find volunteer opportunity pages.
    """
    
    def __init__(self, source):
        super().__init__(source)
        self.visited_urls = set()
        self.opportunity_urls = []
    
    def crawl(self) -> List[Dict[str, Any]]:
        """Crawl a nonprofit website looking for volunteer opportunities"""
        opportunities = []
        
        # First, try to find volunteer/opportunities pages
        volunteer_pages = self.find_volunteer_pages()
        
        if not volunteer_pages:
            logger.warning(f"No volunteer pages found for {self.source.name}")
            return opportunities
        
        # Visit each volunteer page and extract opportunities
        for page_url in volunteer_pages[:self.source.max_pages_per_crawl]:
            page_opportunities = self.extract_opportunities_from_page(page_url)
            opportunities.extend(page_opportunities)
        
        logger.info(f"Found {len(opportunities)} opportunities from {len(volunteer_pages)} pages")
        return opportunities
    
    def find_volunteer_pages(self) -> List[str]:
        """Find pages likely to contain volunteer opportunities"""
        volunteer_urls = []
        
        # Common volunteer page patterns
        volunteer_keywords = [
            'volunteer', 'opportunities', 'get-involved', 'help', 'support',
            'join', 'participate', 'contribute', 'positions', 'openings'
        ]
        
        # Start from the home page
        response = self.fetch_page(self.source.base_url)
        if not response:
            return volunteer_urls
        
        self.visited_urls.add(self.source.base_url)
        soup = self.parse_html(response.text)
        
        # Look for links containing volunteer keywords
        all_links = soup.find_all('a', href=True)
        
        for link in all_links:
            href = link.get('href', '')
            text = link.get_text().lower()
            full_url = normalize_url(href, self.source.base_url)
            
            if not full_url or full_url in self.visited_urls:
                continue
            
            # Check if URL or link text contains volunteer keywords
            url_lower = full_url.lower()
            for keyword in volunteer_keywords:
                if keyword in url_lower or keyword in text:
                    volunteer_urls.append(full_url)
                    self.visited_urls.add(full_url)
                    break
        
        # Also check common URL patterns
        common_paths = [
            '/volunteer', '/volunteers', '/volunteering',
            '/opportunities', '/get-involved', '/how-to-help',
            '/support-us', '/join-us', '/positions'
        ]
        
        for path in common_paths:
            test_url = urljoin(self.source.base_url, path)
            if test_url not in self.visited_urls:
                response = self.fetch_page(test_url)
                if response and response.status_code == 200:
                    volunteer_urls.append(test_url)
                    self.visited_urls.add(test_url)
        
        return volunteer_urls
    
    def extract_opportunities_from_page(self, page_url: str) -> List[Dict[str, Any]]:
        """Extract volunteer opportunities from a page"""
        opportunities = []
        
        response = self.fetch_page(page_url)
        if not response:
            return opportunities
        
        soup = self.parse_html(response.text)
        
        # Try multiple strategies to find opportunities
        
        # Strategy 1: Look for structured data (JSON-LD)
        json_opportunities = self.extract_jsonld_opportunities(soup)
        opportunities.extend(json_opportunities)
        
        # Strategy 2: Look for opportunity cards/sections
        card_opportunities = self.extract_opportunity_cards(soup, page_url)
        opportunities.extend(card_opportunities)
        
        # Strategy 3: Check if page contains multiple date-based events
        if not opportunities:
            event_opportunities = self.extract_event_based_opportunities(soup, page_url)
            opportunities.extend(event_opportunities)
        
        # Strategy 4: Parse the page as a single opportunity if it looks like one
        if not opportunities:
            single_opp = self.parse_as_single_opportunity(soup, page_url)
            if single_opp:
                opportunities.append(single_opp)
        
        return opportunities
    
    def extract_jsonld_opportunities(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract opportunities from JSON-LD structured data"""
        opportunities = []
        
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                import json
                data = json.loads(script.string)
                
                # Handle single item or array
                items = data if isinstance(data, list) else [data]
                
                for item in items:
                    if item.get('@type') == 'VolunteerOpportunity':
                        opp = self.parse_jsonld_opportunity(item)
                        if opp:
                            opportunities.append(opp)
            except Exception as e:
                logger.debug(f"Error parsing JSON-LD: {e}")
                continue
        
        return opportunities
    
    def parse_jsonld_opportunity(self, data: Dict) -> Optional[Dict[str, Any]]:
        """Parse a JSON-LD VolunteerOpportunity"""
        opp = {
            'title': data.get('name', ''),
            'description': data.get('description', ''),
            'source_url': data.get('url', ''),
            'external_id': data.get('@id', ''),
        }
        
        # Organization
        if 'organizer' in data:
            org = data['organizer']
            opp['organization_name'] = org.get('name', '')
            opp['organization_url'] = org.get('url', '')
        
        # Location
        if 'location' in data:
            loc = data['location']
            if isinstance(loc, dict):
                opp['location_text'] = loc.get('name', '') or loc.get('address', '')
                if 'address' in loc and isinstance(loc['address'], dict):
                    addr = loc['address']
                    opp['city'] = addr.get('addressLocality', '')
                    opp['state'] = addr.get('addressRegion', '')
                    opp['zip_code'] = addr.get('postalCode', '')
        
        # Dates
        if 'startDate' in data:
            opp['start_date_text'] = data['startDate']
        if 'endDate' in data:
            opp['end_date_text'] = data['endDate']
        
        return opp if opp['title'] and opp['description'] else None
    
    def extract_opportunity_cards(self, soup: BeautifulSoup, page_url: str) -> List[Dict[str, Any]]:
        """Extract opportunities from card-like structures on the page"""
        opportunities = []
        
        # Common patterns for opportunity cards
        card_selectors = [
            'div.opportunity', 'div.volunteer-opportunity',
            'article.opportunity', 'section.opportunity',
            'div.position', 'div.opening',
            'li.opportunity', 'div.job'
        ]
        
        for selector in card_selectors:
            cards = soup.select(selector)
            if cards:
                for card in cards:
                    opp = self.parse_opportunity_card(card, page_url)
                    if opp:
                        opportunities.append(opp)
                break
        
        # If no specific cards found, look for lists with opportunity-like content
        if not opportunities:
            opportunities.extend(self.extract_from_lists(soup, page_url))
        
        return opportunities
    
    def parse_opportunity_card(self, card: BeautifulSoup, page_url: str) -> Optional[Dict[str, Any]]:
        """Parse an opportunity from a card element"""
        # Extract organization name from the page
        org_name = self.extract_organization_name(card.find_parent('html'))
        
        data = {
            'organization_name': org_name,
            'organization_url': self.source.base_url,
        }
        
        # Title - try multiple selectors
        title_selectors = ['h1', 'h2', 'h3', 'h4', '.title', '.heading']
        for selector in title_selectors:
            title_elem = card.select_one(selector)
            if title_elem:
                data['title'] = self.clean_text(title_elem.get_text())
                break
        
        if not data.get('title'):
            return None
        
        # URL - check if title is a link
        link = card.find('a')
        if link and link.get('href'):
            data['source_url'] = normalize_url(link['href'], page_url)
        else:
            # Use page URL + fragment if available
            if card.get('id'):
                data['source_url'] = f"{page_url}#{card['id']}"
            else:
                data['source_url'] = page_url
        
        # Description
        desc_selectors = ['p', '.description', '.content', '.details']
        for selector in desc_selectors:
            desc_elem = card.select_one(selector)
            if desc_elem:
                data['description'] = self.clean_text(desc_elem.get_text())
                break
        
        # Location
        location_selectors = ['.location', '.address', 'address']
        for selector in location_selectors:
            loc_elem = card.select_one(selector)
            if loc_elem:
                location_text = self.clean_text(loc_elem.get_text())
                data['location_text'] = location_text
                data.update(self.extract_location_parts(location_text))
                break
        
        # Time commitment
        time_selectors = ['.time', '.schedule', '.commitment', '.duration']
        for selector in time_selectors:
            time_elem = card.select_one(selector)
            if time_elem:
                data['time_commitment_text'] = self.clean_text(time_elem.get_text())
                break
        
        # Extract all text for skill/cause analysis
        all_text = card.get_text()
        data['skills_text'] = ' '.join(extract_skills_from_text(all_text))
        data['cause_areas_text'] = ', '.join(extract_cause_areas(all_text))
        
        return data
    
    def extract_from_lists(self, soup: BeautifulSoup, page_url: str) -> List[Dict[str, Any]]:
        """Extract opportunities from list structures"""
        opportunities = []
        
        # Look for lists that might contain opportunities
        lists = soup.find_all(['ul', 'ol'])
        
        for lst in lists:
            items = lst.find_all('li')
            if len(items) < 2 or len(items) > 20:  # Skip very small or very large lists
                continue
            
            # Check if list items look like opportunities
            opportunity_count = 0
            for item in items:
                text = item.get_text().lower()
                if any(word in text for word in ['volunteer', 'help', 'assist', 'support', 'need']):
                    opportunity_count += 1
            
            if opportunity_count >= len(items) * 0.5:  # At least half look like opportunities
                org_name = self.extract_organization_name(soup)
                
                for item in items:
                    opp = self.parse_list_item_opportunity(item, page_url, org_name)
                    if opp:
                        opportunities.append(opp)
        
        return opportunities
    
    def parse_list_item_opportunity(self, item: BeautifulSoup, page_url: str, org_name: str) -> Optional[Dict[str, Any]]:
        """Parse an opportunity from a list item"""
        text = self.clean_text(item.get_text())
        if len(text) < 10:  # Too short
            return None
        
        # Use the first line/sentence as title
        lines = text.split('\n')
        title = lines[0].strip()
        if len(lines) > 1:
            description = '\n'.join(lines[1:]).strip()
        else:
            description = title
        
        data = {
            'title': title[:200],  # Limit title length
            'description': description,
            'organization_name': org_name,
            'organization_url': self.source.base_url,
            'source_url': page_url,
        }
        
        # Extract any embedded information
        link = item.find('a')
        if link and link.get('href'):
            data['source_url'] = normalize_url(link['href'], page_url)
        
        # Look for contact info
        contact_info = parse_contact_info(text)
        if contact_info.get('email'):
            data['contact_email'] = contact_info['email']
        
        return data
    
    def extract_event_based_opportunities(self, soup: BeautifulSoup, page_url: str) -> List[Dict[str, Any]]:
        """Extract opportunities from pages that list multiple date-based events"""
        opportunities = []
        
        # Get page text
        page_text = soup.get_text()
        
        # Check if this looks like an event listing page
        if 'urgent' in page_text.lower() or page_text.count('/') > 10:
            # Extract events from the text
            events = extract_volunteer_events(page_text)
            
            if events:
                org_name = self.extract_organization_name(soup)
                
                # Get any header/intro text
                intro_text = ""
                for heading in soup.find_all(['h1', 'h2', 'h3']):
                    if 'urgent' in heading.get_text().lower():
                        # Get text after this heading
                        next_sibling = heading.next_sibling
                        if next_sibling and hasattr(next_sibling, 'get_text'):
                            intro_text = self.clean_text(next_sibling.get_text())[:500]
                        break
                
                for event in events:
                    # Create a descriptive title
                    title = f"{event.get('description', 'Volunteer Opportunity')} - {event.get('date', '')}"
                    if event.get('time'):
                        title += f" {event['time']}"
                    
                    # Build description
                    description_parts = []
                    if intro_text:
                        description_parts.append(intro_text)
                    
                    if event.get('description'):
                        description_parts.append(f"Activity: {event['description']}")
                    
                    if event.get('location'):
                        description_parts.append(f"Location: {event['location']}")
                    
                    if event.get('type'):
                        description_parts.append(f"Type: {event['type']}")
                    
                    description = '\n\n'.join(description_parts)
                    
                    opp = {
                        'title': self.clean_text(title),
                        'description': clean_description(description),
                        'organization_name': org_name,
                        'organization_url': self.source.base_url,
                        'source_url': page_url,
                        'location_text': event.get('location', ''),
                        'start_date_text': event.get('date', ''),
                        'time_commitment_text': event.get('time', ''),
                    }
                    
                    # Extract location parts
                    if event.get('location'):
                        opp.update(self.extract_location_parts(event['location']))
                    
                    opportunities.append(opp)
        
        return opportunities
    
    def parse_as_single_opportunity(self, soup: BeautifulSoup, page_url: str) -> Optional[Dict[str, Any]]:
        """Try to parse the entire page as a single opportunity"""
        # Check if page has opportunity-like content
        page_text = soup.get_text().lower()
        if not any(word in page_text for word in ['volunteer', 'help', 'opportunity', 'position']):
            return None
        
        org_name = self.extract_organization_name(soup)
        
        data = {
            'organization_name': org_name,
            'organization_url': self.source.base_url,
            'source_url': page_url,
        }
        
        # Title from page title or H1
        title_elem = soup.find('h1') or soup.find('title')
        if title_elem:
            data['title'] = self.clean_text(title_elem.get_text())
        
        # Main content
        main_selectors = ['main', 'article', '.content', '#content', '.main']
        for selector in main_selectors:
            main_elem = soup.select_one(selector)
            if main_elem:
                # Remove navigation and footer
                for nav in main_elem.find_all(['nav', 'footer', 'header']):
                    nav.decompose()
                
                data['description'] = self.clean_text(main_elem.get_text())[:2000]
                break
        
        if not data.get('description'):
            # Fall back to body text
            body = soup.find('body')
            if body:
                data['description'] = self.clean_text(body.get_text())[:2000]
        
        # Extract structured information
        all_text = soup.get_text()
        data['skills_text'] = ' '.join(extract_skills_from_text(all_text))
        data['cause_areas_text'] = ', '.join(extract_cause_areas(all_text))
        
        # Look for contact information
        contact_info = parse_contact_info(all_text)
        if contact_info.get('email'):
            data['contact_email'] = contact_info['email']
        
        return data if data.get('title') and data.get('description') else None
    
    def extract_organization_name(self, soup: BeautifulSoup) -> str:
        """Extract organization name from the page"""
        # Try meta tags first
        meta_selectors = [
            ('meta', {'property': 'og:site_name'}),
            ('meta', {'name': 'author'}),
            ('meta', {'name': 'organization'}),
        ]
        
        for tag, attrs in meta_selectors:
            elem = soup.find(tag, attrs)
            if elem and elem.get('content'):
                return clean_organization_name(elem['content'])
        
        # Try common page elements
        name_selectors = ['.site-name', '.org-name', '.logo', 'h1.brand']
        for selector in name_selectors:
            elem = soup.select_one(selector)
            if elem:
                return clean_organization_name(elem.get_text())
        
        # Try title tag
        title = soup.find('title')
        if title:
            title_text = title.get_text()
            # Remove common suffixes
            title_parts = title_text.split(' - ')
            if len(title_parts) > 1:
                return clean_organization_name(title_parts[-1])
            
            title_parts = title_text.split(' | ')
            if len(title_parts) > 1:
                return clean_organization_name(title_parts[-1])
        
        # Fall back to domain name
        parsed_url = urlparse(self.source.base_url)
        domain = parsed_url.netloc.replace('www.', '')
        return domain.split('.')[0].title()
    
    def parse_opportunity(self, item: Any) -> Optional[Dict[str, Any]]:
        """Required by base class but not used in this implementation"""
        return None