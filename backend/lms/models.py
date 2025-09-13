from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import uuid

User = get_user_model()


class Course(models.Model):
    """Learning Management System courses"""
    
    AUDIENCE_TYPE_CHOICES = [
        ('volunteer', 'Volunteer'),
        ('host', 'Host'),
        ('both', 'Both'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    audience_type = models.CharField(max_length=20, choices=AUDIENCE_TYPE_CHOICES, default='both')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_duration = models.PositiveIntegerField(help_text="Duration in minutes")
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
        indexes = [
            models.Index(fields=['audience_type']),
            models.Index(fields=['is_required']),
            models.Index(fields=['is_active']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Module(models.Model):
    """Course modules/lessons"""
    
    CONTENT_TYPE_CHOICES = [
        ('text', 'Text'),
        ('video', 'Video'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    content = models.TextField()
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, default='text')
    video_url = models.URLField(max_length=300, blank=True)
    display_order = models.PositiveSmallIntegerField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order']
        unique_together = [['course', 'display_order']]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """Course enrollments"""
    
    COMPLETION_STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    completion_status = models.CharField(max_length=20, choices=COMPLETION_STATUS_CHOICES, default='not_started')
    progress_percentage = models.PositiveSmallIntegerField(default=0)
    certificate_issued = models.BooleanField(default=False)
    
    class Meta:
        unique_together = [['user', 'course']]
        indexes = [
            models.Index(fields=['user', 'completion_status']),
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    def update_progress(self):
        """Calculate and update progress based on completed modules"""
        total_modules = self.course.modules.count()
        if total_modules == 0:
            return
        
        completed_modules = self.module_progress.filter(completed=True).count()
        self.progress_percentage = int((completed_modules / total_modules) * 100)
        
        if self.progress_percentage == 100:
            self.completion_status = 'completed'
            self.completion_date = models.functions.Now()
        elif self.progress_percentage > 0:
            self.completion_status = 'in_progress'
        
        self.save()


class ModuleProgress(models.Model):
    """Track progress for individual modules"""
    
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='module_progress')
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent = models.PositiveIntegerField(default=0, help_text="Time spent in seconds")
    quiz_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = [['enrollment', 'module']]
    
    def __str__(self):
        return f"{self.enrollment.user.username} - {self.module.title}"