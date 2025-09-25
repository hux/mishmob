import re
import hashlib
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse


def normalize_url(url: str, base_url: str = '') -> str:
    """Normalize and resolve relative URLs"""
    if not url:
        return ''
    
    # Handle relative URLs
    if base_url and not url.startswith(('http://', 'https://')):
        url = urljoin(base_url, url)
    
    # Remove fragment
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"


def extract_skills_from_text(text: str) -> List[str]:
    """Extract potential skills from text using keywords and patterns"""
    if not text:
        return []
    
    # Common skill keywords to look for
    skill_patterns = [
        # Programming languages
        r'\b(Python|Java|JavaScript|TypeScript|C\+\+|C#|Ruby|PHP|Swift|Go|Rust|SQL)\b',
        # Frameworks
        r'\b(React|Angular|Vue|Django|Flask|Spring|Rails|Laravel|Node\.js|Express)\b',
        # Tools
        r'\b(Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|CI/CD|Jira|Agile|Scrum)\b',
        # Data skills
        r'\b(Machine Learning|Data Analysis|Data Science|Statistics|Excel|Tableau|PowerBI)\b',
        # Design
        r'\b(Photoshop|Illustrator|Figma|Sketch|UI/UX|Graphic Design|Web Design)\b',
        # Soft skills
        r'\b(Leadership|Communication|Project Management|Teaching|Mentoring|Public Speaking)\b',
        # Marketing
        r'\b(Social Media|Marketing|SEO|Content Writing|Copywriting|Email Marketing)\b',
        # Other
        r'\b(Fundraising|Grant Writing|Event Planning|Community Outreach|Customer Service)\b',
    ]
    
    skills = set()
    text_upper = text
    
    for pattern in skill_patterns:
        matches = re.finditer(pattern, text_upper, re.IGNORECASE)
        for match in matches:
            skill = match.group(0)
            # Normalize common variations
            skill = skill.replace('Node.js', 'NodeJS')
            skill = skill.replace('CI/CD', 'CI-CD')
            skills.add(skill.title())
    
    return sorted(list(skills))


def parse_time_commitment(text: str) -> Dict[str, any]:
    """Parse time commitment text into structured format"""
    if not text:
        return {'hours_per_week': None, 'duration': None, 'schedule': None}
    
    result = {
        'hours_per_week': None,
        'duration': None,
        'schedule': None,
        'original_text': text
    }
    
    # Extract hours per week
    hours_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*hours?\s*(?:per|/)\s*week',
        r'(\d+(?:\.\d+)?)\s*hours?\s*(?:per|/)\s*week',
        r'(\d+(?:\.\d+)?)\s*hrs?\s*(?:per|/)\s*wk',
    ]
    
    for pattern in hours_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if len(match.groups()) == 2:
                result['hours_per_week'] = f"{match.group(1)}-{match.group(2)}"
            else:
                result['hours_per_week'] = match.group(1)
            break
    
    # Extract duration
    duration_patterns = [
        r'(\d+)\s*(?:-|to)\s*(\d+)\s*(weeks?|months?)',
        r'(\d+)\s*(weeks?|months?)',
        r'(ongoing|continuous|indefinite)',
    ]
    
    for pattern in duration_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if match.group(0).lower() in ['ongoing', 'continuous', 'indefinite']:
                result['duration'] = 'ongoing'
            elif len(match.groups()) >= 3:
                result['duration'] = f"{match.group(1)}-{match.group(2)} {match.group(3)}"
            else:
                result['duration'] = f"{match.group(1)} {match.group(2)}"
            break
    
    # Extract schedule
    schedule_keywords = ['flexible', 'weekends', 'evenings', 'weekdays', 'remote', 'on-site']
    for keyword in schedule_keywords:
        if keyword in text.lower():
            if not result['schedule']:
                result['schedule'] = keyword
            else:
                result['schedule'] += f", {keyword}"
    
    return result


def extract_cause_areas(text: str) -> List[str]:
    """Extract cause areas from text"""
    cause_area_keywords = {
        'education': ['education', 'teaching', 'tutoring', 'literacy', 'school'],
        'environment': ['environment', 'conservation', 'sustainability', 'climate', 'green'],
        'health': ['health', 'medical', 'wellness', 'mental health', 'healthcare'],
        'housing': ['housing', 'homeless', 'shelter', 'affordable housing'],
        'hunger': ['hunger', 'food', 'nutrition', 'food bank', 'meal'],
        'seniors': ['senior', 'elderly', 'aging', 'elder care'],
        'youth': ['youth', 'children', 'kids', 'teen', 'young people'],
        'animals': ['animal', 'pet', 'wildlife', 'rescue'],
        'arts': ['art', 'music', 'culture', 'museum', 'theater'],
        'community': ['community', 'neighborhood', 'civic', 'local'],
        'emergency': ['emergency', 'disaster', 'crisis', 'relief'],
    }
    
    found_areas = set()
    text_lower = text.lower()
    
    for area, keywords in cause_area_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                found_areas.add(area)
                break
    
    return sorted(list(found_areas))


def generate_opportunity_hash(title: str, org_name: str) -> str:
    """Generate a hash for deduplication based on title and organization"""
    content = f"{title.lower().strip()}:{org_name.lower().strip()}"
    return hashlib.md5(content.encode()).hexdigest()


def is_valid_opportunity(data: Dict[str, any]) -> bool:
    """Check if opportunity data meets minimum requirements"""
    required_fields = ['title', 'organization_name', 'description']
    
    for field in required_fields:
        if not data.get(field):
            return False
    
    # Check minimum lengths
    if len(data['title']) < 5:
        return False
    
    if len(data['description']) < 50:
        return False
    
    return True


def clean_organization_name(name: str) -> str:
    """Clean and standardize organization names"""
    if not name:
        return ''
    
    # Remove common suffixes
    suffixes = [
        ', Inc.', ' Inc.', ', LLC', ' LLC', ', Ltd.', ' Ltd.',
        ', Corp.', ' Corp.', ', Corporation', ' Corporation'
    ]
    
    cleaned = name.strip()
    for suffix in suffixes:
        if cleaned.endswith(suffix):
            cleaned = cleaned[:-len(suffix)]
    
    return cleaned.strip()


def clean_description(text: str) -> str:
    """Clean description text by removing navigation elements and formatting issues"""
    if not text:
        return ''
    
    # Common navigation patterns to remove
    nav_patterns = [
        r'Skip to main content',
        r'Open side bar',
        r'Return to our Website',
        r'Sign Up Login Help',
        r'Calendar Open top navigation menu',
        r'Home Dashboard',
        r'Get Connected Icon',
        r'Collapse Menu',
        r'Privacy Policy',
        r'Contact Us',
        r'Our websites uses cookies.*?exper',
        r'This site uses cookies.*?experience',
        r'×',  # Close button
        r'Facebook Facebook',
        r'X/Twitter X/Twitter',
        r'YouTube Youtube',
        r'LinkedIn LinkedIn',
        r'Instagram Instagram',
        r'Updated: \d+/\d+ at \d+:\d+[ap]m',
    ]
    
    cleaned = text
    
    # Remove navigation patterns
    for pattern in nav_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    # Remove duplicate spaces and normalize whitespace
    cleaned = ' '.join(cleaned.split())
    
    # Remove repeated menu items
    cleaned = re.sub(r'(\b\w+\b)(\s+\1)+', r'\1', cleaned)
    
    # Clean up common formatting issues
    cleaned = cleaned.replace(' | ', ' - ')
    cleaned = re.sub(r'\s*-\s*-\s*', ' - ', cleaned)
    cleaned = re.sub(r'\s*\|\s*\|\s*', ' | ', cleaned)
    
    # Remove trailing navigation text if present
    navigation_endings = [
        'Privacy Policy Contact Us',
        'Facebook X/Twitter YouTube LinkedIn Instagram',
        'This site uses cookies',
        'Our websites uses cookies',
    ]
    
    for ending in navigation_endings:
        if cleaned.endswith(ending):
            cleaned = cleaned[:-len(ending)].strip()
    
    return cleaned.strip()


def extract_volunteer_events(text: str) -> List[Dict[str, str]]:
    """Extract individual volunteer events from a text block"""
    events = []
    
    # Pattern for date-based events like "Thurs 9/25 | 9:30am-11:30am | Location | Type"
    event_pattern = r'((?:Mon|Tues?|Wed|Thurs?|Fri|Sat|Sun)\s+\d{1,2}/\d{1,2})\s*[|:]?\s*([^|]+?)(?:\s*\|\s*([^|]+?))?(?:\s*\|\s*([^|]+?))?(?=(?:Mon|Tues?|Wed|Thurs?|Fri|Sat|Sun)\s+\d{1,2}/\d{1,2}|$)'
    
    matches = re.finditer(event_pattern, text, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        date = match.group(1).strip()
        details = match.group(2).strip() if match.group(2) else ''
        location = match.group(3).strip() if match.group(3) else ''
        event_type = match.group(4).strip() if match.group(4) else ''
        
        # Clean up the details
        if details:
            # Remove duplicate location info if it appears in details
            if location and location in details:
                details = details.replace(location, '').strip()
            
            event = {
                'date': date,
                'time': '',
                'location': location,
                'type': event_type,
                'description': details
            }
            
            # Try to extract time from details
            time_match = re.search(r'\d{1,2}:\d{2}[ap]m(?:\s*-\s*\d{1,2}:\d{2}[ap]m)?', details, re.IGNORECASE)
            if time_match:
                event['time'] = time_match.group(0)
                event['description'] = details.replace(time_match.group(0), '').strip()
            
            events.append(event)
    
    return events


def parse_contact_info(text: str) -> Dict[str, str]:
    """Extract contact information from text"""
    contact = {
        'email': '',
        'phone': '',
        'website': ''
    }
    
    # Email pattern
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        contact['email'] = email_match.group(0)
    
    # Phone pattern (US numbers)
    phone_patterns = [
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\d{3}[-.\s]?\d{4}'
    ]
    
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            contact['phone'] = phone_match.group(0)
            break
    
    # Website pattern
    url_match = re.search(r'https?://[^\s]+', text)
    if url_match:
        contact['website'] = url_match.group(0).rstrip('.,;:')
    
    return contact