from lms.models import Course, Module
from django.utils.text import slugify

# Create a volunteer course
course1 = Course.objects.create(
    title="Getting Started as a MishMob Volunteer",
    slug=slugify("Getting Started as a MishMob Volunteer"),
    description="Learn the basics of volunteering with MishMob, including our mission, values, and how to find opportunities that match your skills.",
    category="volunteer",
    estimated_hours=1,
    is_published=True
)

Module.objects.create(
    course=course1,
    title="Welcome to MishMob",
    content="<h2>Welcome to the MishMob Community!</h2><p>MishMob connects skilled volunteers with meaningful opportunities in their communities. Our platform uses AI-powered matching to help you find the perfect volunteer opportunities based on your skills, interests, and availability.</p><h3>Our Mission</h3><p>We envision a world where purpose, meaning, and belonging are accessible to everyone through action.</p>",
    order=1
)

Module.objects.create(
    course=course1,
    title="Creating Your Volunteer Profile", 
    content="<h2>Building an Effective Volunteer Profile</h2><p>Your volunteer profile is key to finding the right opportunities. Upload your resume, connect LinkedIn, add a bio, and set your availability to get matched with the perfect opportunities.</p>",
    order=2
)

print(f"Created: {course1.title}")

# Create a host course
course2 = Course.objects.create(
    title="Hosting Successful Volunteer Opportunities",
    slug=slugify("Hosting Successful Volunteer Opportunities"),
    description="Learn how to create, manage, and optimize volunteer opportunities that attract skilled volunteers and create meaningful impact.",
    category="host",
    estimated_hours=2,
    is_published=True
)

Module.objects.create(
    course=course2,
    title="Creating Compelling Opportunities",
    content="<h2>Designing Volunteer Opportunities That Attract Top Talent</h2><p>Creating clear, engaging opportunity listings is crucial for attracting the right volunteers. Include a clear title, detailed description, required skills, time commitment, and impact statement.</p>",
    order=1
)

Module.objects.create(
    course=course2,
    title="Volunteer Management Best Practices",
    content="<h2>Building a Successful Volunteer Program</h2><p>Effective volunteer management ensures positive experiences and lasting impact. Focus on onboarding, communication, recognition, and feedback.</p>",
    order=2
)

print(f"Created: {course2.title}")

# Create a general course
course3 = Course.objects.create(
    title="Introduction to Community Service",
    slug=slugify("Introduction to Community Service"),
    description="An overview of community service, its importance, and how to get involved.",
    category="general",
    estimated_hours=0.5,
    is_published=True
)

Module.objects.create(
    course=course3,
    title="Why Community Service Matters",
    content="<h2>The Power of Community Service</h2><p>Community service is more than just volunteering—it's about creating lasting change and building stronger communities. Discover personal growth, community impact, social connections, and career development opportunities.</p>",
    order=1
)

print(f"Created: {course3.title}")
print(f"Total courses created: {Course.objects.count()}")