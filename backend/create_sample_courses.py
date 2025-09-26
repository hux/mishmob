#!/usr/bin/env python
"""Create sample courses for testing"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from lms.models import Course, Module
from users.models import User

# Get or create a staff user
staff_user = User.objects.filter(is_staff=True).first()
if not staff_user:
    staff_user = User.objects.create_user(
        username='courseadmin',
        email='courseadmin@example.com',
        password='admin123',
        is_staff=True,
        first_name='Course',
        last_name='Admin'
    )
    print(f"Created staff user: {staff_user.username}")

# Sample courses
sample_courses = [
    {
        "title": "Volunteer Orientation",
        "slug": "volunteer-orientation",
        "description": "Essential training for new volunteers. Learn about our mission, values, and how to make the most impact in your community.",
        "audience_type": "volunteer",
        "difficulty_level": "beginner",
        "category": "Onboarding",
        "estimated_duration": 60,
        "modules": [
            {
                "title": "Welcome to MishMob",
                "content": "<h2>Welcome!</h2><p>We're excited to have you join our community of volunteers.</p>",
                "content_type": "text",
                "duration": 10,
                "display_order": 1
            },
            {
                "title": "Our Mission and Values",
                "content": "<h2>Our Mission</h2><p>Learn about what drives us and how we make an impact.</p>",
                "content_type": "text",
                "duration": 15,
                "display_order": 2
            },
            {
                "title": "Safety Guidelines",
                "content": "<h2>Safety First</h2><p>Important safety information for all volunteers.</p>",
                "content_type": "text",
                "duration": 20,
                "display_order": 3
            }
        ]
    },
    {
        "title": "Host Organization Training",
        "slug": "host-organization-training",
        "description": "Learn how to create effective volunteer opportunities and manage volunteer teams.",
        "audience_type": "host",
        "difficulty_level": "intermediate",
        "category": "Management",
        "estimated_duration": 90,
        "modules": [
            {
                "title": "Creating Great Opportunities",
                "content": "<h2>Opportunity Design</h2><p>Learn to create opportunities that attract qualified volunteers.</p>",
                "content_type": "text",
                "duration": 30,
                "display_order": 1
            },
            {
                "title": "Managing Volunteers",
                "content": "<h2>Volunteer Management</h2><p>Best practices for leading volunteer teams.</p>",
                "content_type": "text",
                "duration": 30,
                "display_order": 2
            }
        ]
    },
    {
        "title": "Digital Skills for Community Impact",
        "slug": "digital-skills-community",
        "description": "Develop digital skills to amplify your community impact through technology.",
        "audience_type": "volunteer",
        "difficulty_level": "intermediate",
        "category": "Skills Development",
        "estimated_duration": 120,
        "modules": [
            {
                "title": "Social Media for Good",
                "content": "<h2>Using Social Media</h2><p>Leverage social media to promote your cause.</p>",
                "content_type": "text",
                "duration": 40,
                "display_order": 1
            },
            {
                "title": "Digital Storytelling",
                "content": "<h2>Tell Your Story</h2><p>Create compelling narratives about your impact.</p>",
                "content_type": "text",
                "duration": 40,
                "display_order": 2
            }
        ]
    }
]

# Create courses
for course_data in sample_courses:
    modules = course_data.pop('modules')
    
    # Check if course already exists
    course, created = Course.objects.get_or_create(
        slug=course_data['slug'],
        defaults={**course_data, 'created_by': staff_user, 'is_published': True}
    )
    
    if created:
        print(f"Created course: {course.title}")
        
        # Create modules
        for module_data in modules:
            module = Module.objects.create(
                course=course,
                **module_data
            )
            print(f"  - Added module: {module.title}")
    else:
        print(f"Course already exists: {course.title}")

print(f"\nTotal courses: {Course.objects.count()}")
print(f"Published courses: {Course.objects.filter(is_published=True).count()}")