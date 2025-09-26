from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
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
    is_published = models.BooleanField(default=False)
    
    # Course metadata
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    
    # Certificate settings
    provides_certificate = models.BooleanField(default=True)
    certificate_template = models.CharField(max_length=50, default='default')
    passing_score = models.IntegerField(
        default=80,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Minimum score percentage for certificate"
    )
    
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


class Quiz(models.Model):
    """Quiz for course modules"""
    module = models.OneToOneField(Module, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    passing_score = models.IntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    max_attempts = models.IntegerField(default=3, help_text="0 for unlimited attempts")
    time_limit_minutes = models.IntegerField(null=True, blank=True)
    randomize_questions = models.BooleanField(default=False)
    show_correct_answers = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Quiz: {self.title}"


class Question(models.Model):
    """Quiz questions"""
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    explanation = models.TextField(blank=True)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return self.question_text[:50]


class Answer(models.Model):
    """Answer choices for questions"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.answer_text[:50]


class QuizAttempt(models.Model):
    """Track quiz attempts"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-started_at']
        
    def calculate_score(self):
        """Calculate the final score"""
        total_points = 0
        earned_points = 0
        
        for answer in self.answers.all():
            total_points += answer.question.points
            if answer.is_correct:
                earned_points += answer.question.points
        
        if total_points > 0:
            self.score = (earned_points / total_points) * 100
            self.passed = self.score >= self.quiz.passing_score
        else:
            self.score = 0
            self.passed = False
            
        self.completed_at = timezone.now()
        self.save()


class QuizAnswer(models.Model):
    """User answers for quiz questions"""
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    
    # For multiple choice
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    
    # For text answers
    text_answer = models.TextField(blank=True)
    
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)
    
    class Meta:
        unique_together = [['attempt', 'question']]


class Certificate(models.Model):
    """Course completion certificates"""
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True)
    issued_date = models.DateTimeField(auto_now_add=True)
    
    # Certificate data
    user_name = models.CharField(max_length=200)
    course_title = models.CharField(max_length=200)
    completion_date = models.DateField()
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Verification
    verification_url = models.URLField(max_length=500, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['certificate_id']),
        ]
    
    def __str__(self):
        return f"Certificate for {self.user_name} - {self.course_title}"
    
    def get_verification_url(self):
        """Generate verification URL"""
        from django.urls import reverse
        from django.contrib.sites.models import Site
        
        current_site = Site.objects.get_current()
        path = reverse('verify-certificate', kwargs={'certificate_id': str(self.certificate_id)})
        return f"https://{current_site.domain}{path}"