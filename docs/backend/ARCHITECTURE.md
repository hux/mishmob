# Backend Architecture

## Overview

The MishMob backend is a Django application with Django Ninja for API development, providing a RESTful API for the web and mobile frontends. It follows a modular app structure with clear separation of concerns and uses PostgreSQL for data persistence.

## Technology Stack

### Core Framework
- **Django 5.1.3** - High-level Python web framework
- **Django Ninja 1.3** - Fast, type-safe API framework (FastAPI-style)
- **Python 3.11+** - Programming language
- **Pydantic 2.10** - Data validation using Python type hints

### Database & Storage
- **PostgreSQL 16** - Primary database with PostGIS extension
- **psycopg3** - PostgreSQL adapter for Python
- **Redis 5.2** - Caching and message broker
- **AWS S3** - File storage via boto3 and django-storages

### Authentication & Security
- **JWT** - Token-based authentication
- **django-allauth 65.3** - Social authentication (Google, Facebook, Apple, LinkedIn)
- **django-cors-headers** - CORS handling for cross-origin requests

### Background Tasks & Search
- **Celery 5.4** - Distributed task queue
- **Redis** - Celery message broker
- **Meilisearch 1.11** - Full-text search engine

### Development & Testing
- **pytest 8.3** - Testing framework
- **pytest-django** - Django testing plugin
- **factory-boy** - Test data generation
- **django-debug-toolbar** - Development debugging

### Additional Libraries
- **BeautifulSoup4** - Web scraping
- **Selenium** - Browser automation
- **qrcode[pil] 8.0** - QR code generation
- **geopy 2.4** - Geolocation services
- **Pillow** - Image processing

## Project Structure

```
backend/
├── mishmob/              # Django project settings
│   ├── __init__.py
│   ├── settings.py      # Main settings file
│   ├── urls.py          # Root URL configuration
│   ├── wsgi.py          # WSGI application
│   └── asgi.py          # ASGI application
├── api/                  # Main API app
│   ├── routers/         # API endpoint routers
│   │   ├── __init__.py
│   │   ├── auth.py      # Authentication endpoints
│   │   ├── events.py    # Event management
│   │   ├── lms.py       # Learning management
│   │   ├── messages.py  # Messaging system
│   │   ├── opportunities.py # Opportunity CRUD
│   │   ├── skills.py    # Skills management
│   │   ├── verification.py # ID/background checks
│   │   └── mock_auth.py # Dev authentication
│   ├── migrations/      # Database migrations
│   ├── auth.py         # Auth utilities
│   └── urls.py         # API URL configuration
├── users/               # User management app
│   ├── models.py       # User models
│   ├── admin.py        # Admin interface
│   ├── serializers.py  # API serializers
│   ├── migrations/
│   ├── management/
│   │   └── commands/   # Custom commands
│   └── adapters.py     # Allauth adapters
├── opportunities/       # Opportunities app
│   ├── models.py       # Opportunity models
│   ├── crawlers/       # Web scrapers
│   │   ├── base.py
│   │   ├── generic.py
│   │   ├── volunteermatch.py
│   │   └── utils.py
│   ├── management/
│   │   └── commands/
│   ├── migrations/
│   └── fixtures/       # Test data
├── events/              # Event management app
│   ├── models.py       # Event models
│   ├── admin.py
│   └── migrations/
├── lms/                 # Learning Management System
│   ├── models.py       # Course models
│   ├── admin.py
│   └── migrations/
├── messaging/           # Messaging app
│   ├── models.py       # Message models
│   ├── admin.py
│   └── migrations/
├── shared/              # Shared utilities
│   └── constants.py    # Shared constants
├── requirements.txt     # Python dependencies
├── manage.py           # Django management script
├── Dockerfile          # Production container
├── Dockerfile.dev      # Development container
└── docker-entrypoint.sh # Container startup script
```

## Django Apps Architecture

### 1. Users App
Manages user accounts, profiles, and skills.

**Models:**
```python
class User(AbstractUser):
    user_type = models.CharField(choices=USER_TYPE_CHOICES)
    profile_picture = models.ImageField()
    zip_code = models.CharField(max_length=10)
    is_verified = models.BooleanField(default=False)

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    bio = models.TextField()
    linkedin_url = models.URLField()
    resume = models.FileField()
    parsed_skills_json = models.JSONField()

class Skill(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(choices=SKILL_CATEGORIES)

class UserSkill(models.Model):
    user = models.ForeignKey(User)
    skill = models.ForeignKey(Skill)
    proficiency_level = models.IntegerField(choices=PROFICIENCY_CHOICES)
    is_verified = models.BooleanField(default=False)
```

### 2. Opportunities App
Handles volunteer opportunities and applications.

**Models:**
```python
class OpportunityHost(models.Model):
    organization_name = models.CharField(max_length=200)
    website = models.URLField()
    description = models.TextField()
    is_verified = models.BooleanField(default=False)

class Opportunity(models.Model):
    host = models.ForeignKey(OpportunityHost)
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(choices=STATUS_CHOICES)
    location_zip = models.CharField(max_length=10)
    impact_statement = models.TextField()

class Role(models.Model):
    opportunity = models.ForeignKey(Opportunity)
    title = models.CharField(max_length=100)
    description = models.TextField()
    slots_available = models.IntegerField()

class RoleSkill(models.Model):
    role = models.ForeignKey(Role)
    skill = models.ForeignKey(Skill)
    is_required = models.BooleanField(default=True)
    skill_developed = models.BooleanField(default=False)

class Application(models.Model):
    volunteer = models.ForeignKey(User)
    role = models.ForeignKey(Role)
    status = models.CharField(choices=APPLICATION_STATUS)
    submitted_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField()
```

### 3. Events App
Manages in-person community events with QR ticketing.

**Models:**
```python
class Event(models.Model):
    host = models.ForeignKey(User)
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    location = models.CharField(max_length=300)
    max_attendees = models.IntegerField()
    event_type = models.CharField(choices=EVENT_TYPE_CHOICES)

class EventTicket(models.Model):
    event = models.ForeignKey(Event)
    attendee = models.ForeignKey(User)
    ticket_code = models.CharField(max_length=50, unique=True)
    qr_code = models.ImageField()
    checked_in = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True)
```

### 4. LMS App
Learning Management System for volunteer and host training.

**Models:**
```python
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    audience_type = models.CharField(choices=['volunteer', 'host'])
    is_required = models.BooleanField(default=False)
    estimated_hours = models.DecimalField(max_digits=4, decimal_places=1)

class Module(models.Model):
    course = models.ForeignKey(Course)
    title = models.CharField(max_length=200)
    content = models.TextField()  # Rich text/HTML
    order = models.IntegerField()
    video_url = models.URLField(null=True)

class Enrollment(models.Model):
    user = models.ForeignKey(User)
    course = models.ForeignKey(Course)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
    completion_status = models.CharField(choices=COMPLETION_STATUS)
    progress_percentage = models.IntegerField(default=0)
```

### 5. Messaging App
Real-time messaging between users.

**Models:**
```python
class Conversation(models.Model):
    participants = models.ManyToManyField(User)
    created_at = models.DateTimeField(auto_now_add=True)
    is_group = models.BooleanField(default=False)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation)
    sender = models.ForeignKey(User)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    attachments = models.JSONField(null=True)
```

## API Architecture (Django Ninja)

### API Configuration
```python
# api/urls.py
from ninja import NinjaAPI
from api.routers import auth, opportunities, events, users, lms, messages

api = NinjaAPI(
    title="MishMob API",
    version="1.0.0",
    description="Community volunteer matching platform API",
    auth=JWTAuth(),
)

# Register routers
api.add_router("/auth/", auth.router, tags=["Authentication"])
api.add_router("/opportunities/", opportunities.router, tags=["Opportunities"])
api.add_router("/events/", events.router, tags=["Events"])
api.add_router("/users/", users.router, tags=["Users"])
api.add_router("/lms/", lms.router, tags=["Learning"])
api.add_router("/messages/", messages.router, tags=["Messages"])
```

### Router Example
```python
# api/routers/opportunities.py
from ninja import Router, Query, File
from typing import List
from pydantic import BaseModel

router = Router()

class OpportunitySchema(BaseModel):
    title: str
    description: str
    start_date: datetime
    location_zip: str
    skills: List[int]

@router.get("/", response=List[OpportunitySchema])
def list_opportunities(
    request,
    zip_code: str = Query(None),
    skills: List[int] = Query(None),
    page: int = 1,
):
    """List opportunities with filtering"""
    queryset = Opportunity.objects.filter(status='active')

    if zip_code:
        queryset = queryset.filter(location_zip=zip_code)

    if skills:
        queryset = queryset.filter(roles__skills__in=skills).distinct()

    return queryset

@router.post("/", response=OpportunitySchema)
def create_opportunity(request, data: OpportunitySchema):
    """Create new opportunity (hosts only)"""
    if request.user.user_type != 'host':
        raise PermissionError("Only hosts can create opportunities")

    opportunity = Opportunity.objects.create(
        host=request.user.opportunityhost,
        **data.dict()
    )
    return opportunity

@router.get("/{opportunity_id}", response=OpportunitySchema)
def get_opportunity(request, opportunity_id: int):
    """Get opportunity details"""
    return get_object_or_404(Opportunity, id=opportunity_id)

@router.post("/{opportunity_id}/apply")
def apply_to_opportunity(request, opportunity_id: int, role_id: int):
    """Apply for a role in an opportunity"""
    application = Application.objects.create(
        volunteer=request.user,
        role_id=role_id,
        status='pending'
    )
    return {"application_id": application.id}
```

## Authentication System

### JWT Authentication
```python
# api/auth.py
import jwt
from datetime import datetime, timedelta
from ninja.security import HttpBearer

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            user = User.objects.get(id=payload['user_id'])
            request.user = user
            return user
        except:
            return None

def generate_tokens(user):
    access_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'type': 'access'
    }

    refresh_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7),
        'type': 'refresh'
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY)
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY)

    return {
        'access': access_token,
        'refresh': refresh_token
    }
```

### Social Authentication
```python
# users/adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class MishMobSocialAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """Extract skills from LinkedIn profile"""
        if sociallogin.account.provider == 'linkedin':
            data = sociallogin.account.extra_data
            skills = data.get('skills', [])
            # Store for later processing
            request.session['linkedin_skills'] = skills

    def save_user(self, request, sociallogin, form=None):
        """Create user profile with social data"""
        user = super().save_user(request, sociallogin, form)

        # Create profile
        profile = UserProfile.objects.create(
            user=user,
            linkedin_url=sociallogin.account.extra_data.get('publicProfileUrl')
        )

        # Process LinkedIn skills
        if 'linkedin_skills' in request.session:
            for skill_name in request.session['linkedin_skills']:
                skill, _ = Skill.objects.get_or_create(name=skill_name)
                UserSkill.objects.create(
                    user=user,
                    skill=skill,
                    proficiency_level=3  # Default medium
                )

        return user
```

## Database Configuration

### Settings Configuration
```python
# mishmob/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'mishmob_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,  # Connection pooling
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

# PostGIS for geolocation
INSTALLED_APPS += ['django.contrib.gis']
```

### Database Optimization
```python
# Query optimization with select_related and prefetch_related
opportunities = Opportunity.objects.select_related('host').prefetch_related(
    'roles__skills',
    'applications__volunteer'
).filter(status='active')

# Database indexes
class Meta:
    indexes = [
        models.Index(fields=['location_zip', 'status']),
        models.Index(fields=['start_date', '-created_at']),
    ]
```

## Background Tasks (Celery)

### Celery Configuration
```python
# mishmob/celery.py
from celery import Celery

app = Celery('mishmob')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Settings
CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_TASK_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
```

### Task Examples
```python
# opportunities/tasks.py
from celery import shared_task

@shared_task
def parse_resume(user_id, resume_file_path):
    """Parse resume and extract skills"""
    user = User.objects.get(id=user_id)

    # Call external service
    parsed_data = resume_parser_service.parse(resume_file_path)

    # Update user profile
    profile = user.userprofile
    profile.parsed_skills_json = parsed_data['skills']
    profile.save()

    # Create skill associations
    for skill_name in parsed_data['skills']:
        skill, _ = Skill.objects.get_or_create(name=skill_name)
        UserSkill.objects.get_or_create(
            user=user,
            skill=skill,
            defaults={'proficiency_level': 3}
        )

    return f"Parsed {len(parsed_data['skills'])} skills"

@shared_task
def send_application_notification(application_id):
    """Send email notification for new application"""
    application = Application.objects.get(id=application_id)

    # Send to host
    send_email(
        to=application.role.opportunity.host.user.email,
        subject=f"New application for {application.role.title}",
        template='emails/new_application.html',
        context={'application': application}
    )

@shared_task
def crawl_opportunities():
    """Crawl external sites for opportunities"""
    from opportunities.crawlers import VolunteerMatchCrawler

    crawler = VolunteerMatchCrawler()
    opportunities = crawler.crawl()

    for opp_data in opportunities:
        Opportunity.objects.update_or_create(
            external_id=opp_data['id'],
            defaults=opp_data
        )
```

## Search Integration (Meilisearch)

### Search Configuration
```python
# shared/search.py
import meilisearch

client = meilisearch.Client(
    'http://search:7700',
    os.environ.get('MEILI_MASTER_KEY')
)

def index_opportunity(opportunity):
    """Index opportunity in Meilisearch"""
    index = client.index('opportunities')

    document = {
        'id': opportunity.id,
        'title': opportunity.title,
        'description': opportunity.description,
        'skills': [s.name for s in opportunity.get_required_skills()],
        'location': opportunity.location_zip,
        'organization': opportunity.host.organization_name,
    }

    index.add_documents([document])

def search_opportunities(query, filters=None):
    """Search opportunities"""
    index = client.index('opportunities')

    search_params = {
        'q': query,
        'limit': 20,
    }

    if filters:
        search_params['filter'] = filters

    results = index.search(**search_params)
    return results['hits']
```

## Testing Strategy

### Test Structure
```
backend/
├── tests/
│   ├── conftest.py      # Pytest configuration
│   ├── factories.py     # Test data factories
│   ├── test_api/        # API tests
│   │   ├── test_auth.py
│   │   ├── test_opportunities.py
│   │   └── test_events.py
│   ├── test_models/     # Model tests
│   └── test_tasks/      # Celery task tests
```

### Test Examples
```python
# tests/test_api/test_opportunities.py
import pytest
from django.test import Client

@pytest.mark.django_db
class TestOpportunityAPI:
    def test_list_opportunities(self, client, opportunity_factory):
        opportunities = opportunity_factory.create_batch(3)

        response = client.get('/api/opportunities/')

        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_create_opportunity_requires_host(self, client, user):
        client.force_authenticate(user=user)

        response = client.post('/api/opportunities/', {
            'title': 'Test Opportunity',
            'description': 'Test description',
        })

        assert response.status_code == 403

# tests/factories.py
import factory
from opportunities.models import Opportunity

class OpportunityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Opportunity

    title = factory.Faker('sentence')
    description = factory.Faker('text')
    start_date = factory.Faker('future_datetime')
    location_zip = factory.Faker('zipcode')
```

## Deployment Configuration

### Docker Setup
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD ["gunicorn", "mishmob.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Environment Variables
```bash
# .env.example
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://redis:6379/0
MEILISEARCH_URL=http://search:7700
MEILISEARCH_KEY=masterKey
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=mishmob-storage
```

## Performance Optimization

### Caching Strategy
```python
# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'TIMEOUT': 300,
    }
}

# Cache usage
from django.core.cache import cache

def get_trending_opportunities():
    key = 'trending_opportunities'
    opportunities = cache.get(key)

    if not opportunities:
        opportunities = Opportunity.objects.filter(
            status='active'
        ).order_by('-applications_count')[:10]

        cache.set(key, opportunities, 3600)  # 1 hour

    return opportunities
```

### Query Optimization
```python
# Use only() and defer() for selective field loading
opportunities = Opportunity.objects.only(
    'id', 'title', 'start_date'
).defer('description')

# Bulk operations
Opportunity.objects.bulk_create([
    Opportunity(title='Opp1'),
    Opportunity(title='Opp2'),
])

# Aggregation
from django.db.models import Count, Avg

stats = Opportunity.objects.aggregate(
    total=Count('id'),
    avg_applications=Avg('applications__id')
)
```

## Security Best Practices

### Settings Security
```python
# Production settings
DEBUG = False
ALLOWED_HOSTS = ['mishmob.org', 'www.mishmob.org']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### API Security
```python
# Rate limiting
from django_ratelimit.decorators import ratelimit

@router.post("/login")
@ratelimit(key='ip', rate='5/h', method='POST')
def login(request, credentials: LoginSchema):
    # Login logic
    pass

# Input validation with Pydantic
class OpportunitySchema(BaseModel):
    title: constr(min_length=3, max_length=200)
    description: constr(min_length=10, max_length=5000)
    location_zip: constr(regex=r'^\d{5}$')
```

---

Last updated: October 2024