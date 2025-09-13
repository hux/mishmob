from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import uuid


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    
    USER_TYPE_CHOICES = [
        ('volunteer', 'Volunteer'),
        ('host', 'Host'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='volunteer')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'
        indexes = [
            models.Index(fields=['user_type']),
            models.Index(fields=['zip_code']),
        ]


class UserProfile(models.Model):
    """Extended user profile information"""
    
    BACKGROUND_CHECK_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=1000, blank=True)
    linkedin_url = models.URLField(max_length=200, blank=True)
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    parsed_skills_json = models.JSONField(null=True, blank=True)
    
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    
    date_of_birth = models.DateField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    
    background_check_status = models.CharField(max_length=20, choices=BACKGROUND_CHECK_STATUS, default='pending')
    background_check_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"


class Skill(models.Model):
    """Skills catalog"""
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('creative', 'Creative'),
        ('leadership', 'Leadership'),
        ('social', 'Social'),
        ('physical', 'Physical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class UserSkill(models.Model):
    """User skills with proficiency levels"""
    
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_skills')
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES)
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_skills')
    verified_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['user', 'skill']]
        indexes = [
            models.Index(fields=['user', 'skill']),
            models.Index(fields=['skill']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.get_proficiency_level_display()})"
