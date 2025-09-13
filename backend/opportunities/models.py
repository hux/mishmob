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