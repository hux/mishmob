from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class OpportunityHost(models.Model):
    """Organizations that host opportunities"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='host_profile')
    organization_name = models.CharField(max_length=200)
    organization_type = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    website = models.URLField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='organization_logos/', null=True, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_date = models.DateField(null=True, blank=True)
    
    # Ratings
    rating_average = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['zip_code']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return self.organization_name


class Opportunity(models.Model):
    """Volunteer opportunities/missions"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CAUSE_AREA_CHOICES = [
        ('education', 'Education'),
        ('environment', 'Environment'),
        ('health', 'Health'),
        ('housing', 'Housing'),
        ('hunger', 'Hunger'),
        ('seniors', 'Seniors'),
        ('youth', 'Youth'),
        ('animals', 'Animals'),
        ('arts', 'Arts & Culture'),
        ('community', 'Community'),
        ('emergency', 'Emergency Response'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(OpportunityHost, on_delete=models.CASCADE, related_name='opportunities')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    cause_area = models.CharField(max_length=50, choices=CAUSE_AREA_CHOICES, blank=True)
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    recurring = models.BooleanField(default=False)
    recurring_schedule = models.JSONField(null=True, blank=True)  # For recurring opportunities
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    current_phase = models.CharField(max_length=50, blank=True)
    
    # Location
    location_name = models.CharField(max_length=200)
    location_address = models.CharField(max_length=300)
    location_zip = models.CharField(max_length=10)
    is_remote = models.BooleanField(default=False)
    
    # Details
    impact_statement = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    time_commitment = models.CharField(max_length=100, blank=True)
    
    # Visibility
    featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    
    # Crawler tracking
    is_crawled = models.BooleanField(default=False)
    external_source_url = models.URLField(max_length=500, blank=True)
    last_verified_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['location_zip']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['featured']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Role(models.Model):
    """Roles within opportunities"""
    
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='roles')
    title = models.CharField(max_length=200)
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    slots_available = models.PositiveSmallIntegerField(default=1)
    slots_filled = models.PositiveSmallIntegerField(default=0)
    time_commitment = models.CharField(max_length=100, blank=True)
    is_leadership = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.opportunity.title}"


class RoleSkill(models.Model):
    """Skills associated with roles"""
    
    SKILL_TYPE_CHOICES = [
        ('required', 'Required'),
        ('developed', 'Developed'),
        ('preferred', 'Preferred'),
    ]
    
    IMPORTANCE_CHOICES = [
        ('must_have', 'Must Have'),
        ('nice_to_have', 'Nice to Have'),
        ('optional', 'Optional'),
    ]
    
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_skills')
    skill = models.ForeignKey('users.Skill', on_delete=models.CASCADE)
    skill_type = models.CharField(max_length=20, choices=SKILL_TYPE_CHOICES)
    importance_level = models.CharField(max_length=20, choices=IMPORTANCE_CHOICES, default='nice_to_have')
    
    class Meta:
        unique_together = [['role', 'skill', 'skill_type']]
    
    def __str__(self):
        return f"{self.role.title} - {self.skill.name} ({self.skill_type})"


class Application(models.Model):
    """Volunteer applications for opportunities"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    volunteer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    cover_letter = models.TextField(blank=True)
    availability_notes = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        unique_together = [['volunteer', 'role']]
        indexes = [
            models.Index(fields=['volunteer']),
            models.Index(fields=['opportunity']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.volunteer.username} - {self.role.title}"


class ProjectParticipant(models.Model):
    """Accepted volunteers participating in projects"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='participants')
    volunteer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='participations')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    hours_logged = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    impact_statement = models.TextField(blank=True)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    
    class Meta:
        unique_together = [['opportunity', 'volunteer']]
        indexes = [
            models.Index(fields=['opportunity', 'status']),
            models.Index(fields=['volunteer']),
        ]
    
    def __str__(self):
        return f"{self.volunteer.username} - {self.opportunity.title}"


class CrawlerSource(models.Model):
    """Sources for web crawling nonprofit opportunities"""
    
    SOURCE_TYPE_CHOICES = [
        ('platform', 'Platform (VolunteerMatch, Idealist, etc.)'),
        ('nonprofit', 'Individual Nonprofit Website'),
        ('aggregator', 'Aggregator/Directory'),
        ('rss', 'RSS Feed'),
        ('api', 'API'),
    ]
    
    name = models.CharField(max_length=200)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    base_url = models.URLField(max_length=500)
    crawler_class = models.CharField(max_length=100, help_text="Python class name for the crawler")
    
    is_active = models.BooleanField(default=True)
    crawl_frequency_hours = models.PositiveIntegerField(default=24, help_text="Hours between crawls")
    
    # Configuration
    config = models.JSONField(default=dict, blank=True, help_text="Crawler-specific configuration")
    headers = models.JSONField(default=dict, blank=True, help_text="Custom headers for requests")
    
    # Rate limiting
    rate_limit_delay_seconds = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    max_pages_per_crawl = models.PositiveIntegerField(default=100)
    
    # Statistics
    last_crawl_time = models.DateTimeField(null=True, blank=True)
    last_crawl_status = models.CharField(max_length=50, blank=True)
    last_crawl_error = models.TextField(blank=True)
    total_opportunities_found = models.PositiveIntegerField(default=0)
    total_opportunities_imported = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'last_crawl_time']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.source_type})"


class CrawledOpportunity(models.Model):
    """Raw crawled opportunity data before processing"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('duplicate', 'Duplicate'),
        ('imported', 'Imported'),
    ]
    
    # Source tracking
    source = models.ForeignKey(CrawlerSource, on_delete=models.CASCADE, related_name='crawled_opportunities')
    source_url = models.URLField(max_length=500, unique=True)
    source_id = models.CharField(max_length=200, blank=True, help_text="ID from the source system")
    
    # Raw data
    raw_data = models.JSONField(help_text="Complete raw data from crawler")
    
    # Extracted fields
    title = models.CharField(max_length=300)
    organization_name = models.CharField(max_length=300)
    organization_url = models.URLField(max_length=500, blank=True)
    description = models.TextField()
    
    # Location
    location_text = models.CharField(max_length=500, blank=True)
    city = models.CharField(max_length=200, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    is_remote = models.BooleanField(default=False)
    
    # Dates
    start_date_text = models.CharField(max_length=200, blank=True)
    end_date_text = models.CharField(max_length=200, blank=True)
    parsed_start_date = models.DateField(null=True, blank=True)
    parsed_end_date = models.DateField(null=True, blank=True)
    is_ongoing = models.BooleanField(default=False)
    
    # Details
    time_commitment_text = models.CharField(max_length=300, blank=True)
    skills_text = models.TextField(blank=True)
    cause_areas_text = models.CharField(max_length=500, blank=True)
    
    # Processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    imported_opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True)
    duplicate_of = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Quality scoring
    quality_score = models.DecimalField(max_digits=3, decimal_places=2, default=0, 
                                       help_text="0-1 score based on data completeness")
    validation_errors = models.JSONField(default=list, blank=True)
    
    # Timestamps
    crawled_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-crawled_at']
        indexes = [
            models.Index(fields=['source', 'status']),
            models.Index(fields=['status', 'quality_score']),
            models.Index(fields=['organization_name']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.organization_name} ({self.status})"
    
    def calculate_quality_score(self):
        """Calculate quality score based on data completeness"""
        score = 0.0
        weights = {
            'title': 0.15,
            'organization_name': 0.15,
            'description': 0.20,
            'location_text': 0.10,
            'parsed_start_date': 0.15,
            'time_commitment_text': 0.10,
            'skills_text': 0.10,
            'cause_areas_text': 0.05,
        }
        
        for field, weight in weights.items():
            value = getattr(self, field)
            if value and (not isinstance(value, str) or value.strip()):
                score += weight
        
        # Bonus for long descriptions
        if len(self.description) > 200:
            score = min(1.0, score + 0.05)
        
        self.quality_score = round(score, 2)
        return self.quality_score