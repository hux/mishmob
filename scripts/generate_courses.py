#!/usr/bin/env python
"""
Generate sample courses for MishMob LMS
"""

from django.utils.text import slugify
from lms.models import Course, Module, Quiz, Question, Answer
from django.contrib.auth import get_user_model

User = get_user_model()

def create_courses():
    # Create courses for volunteers
    volunteer_courses = [
        {
            "title": "Getting Started as a MishMob Volunteer",
            "description": "Learn the basics of volunteering with MishMob, including our mission, values, and how to find opportunities that match your skills.",
            "category": "volunteer",
            "estimated_hours": 1,
            "modules": [
                {
                    "title": "Welcome to MishMob",
                    "content": """
                    <h2>Welcome to the MishMob Community!</h2>
                    <p>MishMob connects skilled volunteers with meaningful opportunities in their communities. Our platform uses AI-powered matching to help you find the perfect volunteer opportunities based on your skills, interests, and availability.</p>
                    <h3>Our Mission</h3>
                    <p>We envision a world where purpose, meaning, and belonging are accessible to everyone through action. By enabling individuals to quickly and effectively mobilize around local missions, MishMob unlocks human potential for both individual purpose and community service.</p>
                    <h3>What You'll Learn</h3>
                    <ul>
                        <li>How to create and optimize your volunteer profile</li>
                        <li>How to search for and apply to opportunities</li>
                        <li>Best practices for volunteering</li>
                        <li>How to track your impact</li>
                    </ul>
                    """,
                    "order": 1
                },
                {
                    "title": "Creating Your Volunteer Profile",
                    "content": """
                    <h2>Building an Effective Volunteer Profile</h2>
                    <p>Your volunteer profile is key to finding the right opportunities. Here's how to make it stand out:</p>
                    <h3>Profile Essentials</h3>
                    <ul>
                        <li><strong>Upload Your Resume:</strong> Our AI will extract your skills automatically</li>
                        <li><strong>Connect LinkedIn:</strong> Import your professional experience</li>
                        <li><strong>Add a Bio:</strong> Share what motivates you to volunteer</li>
                        <li><strong>Set Your Availability:</strong> Let organizations know when you're free</li>
                    </ul>
                    <h3>Skills Assessment</h3>
                    <p>Our platform categorizes skills into:</p>
                    <ul>
                        <li>Technical Skills (programming, design, data analysis)</li>
                        <li>Creative Skills (writing, art, music)</li>
                        <li>Leadership Skills (project management, team coordination)</li>
                    </ul>
                    """,
                    "order": 2
                },
                {
                    "title": "Finding and Applying to Opportunities",
                    "content": """
                    <h2>Discovering Your Perfect Match</h2>
                    <p>MishMob makes it easy to find volunteer opportunities that align with your skills and interests.</p>
                    <h3>Search Features</h3>
                    <ul>
                        <li><strong>Location-Based Search:</strong> Find opportunities near you</li>
                        <li><strong>Skills Matching:</strong> See opportunities that need your expertise</li>
                        <li><strong>Time Commitment:</strong> Filter by duration and schedule</li>
                        <li><strong>Cause Areas:</strong> Focus on causes you care about</li>
                    </ul>
                    <h3>Application Tips</h3>
                    <ul>
                        <li>Read the opportunity description carefully</li>
                        <li>Highlight relevant experience in your application</li>
                        <li>Be responsive to organization communications</li>
                        <li>Ask questions if you need clarification</li>
                    </ul>
                    """,
                    "order": 3
                }
            ]
        },
        {
            "title": "Volunteer Safety and Best Practices",
            "description": "Essential safety guidelines and best practices for volunteering in your community.",
            "category": "volunteer",
            "estimated_hours": 1.5,
            "modules": [
                {
                    "title": "Safety First",
                    "content": """
                    <h2>Staying Safe While Volunteering</h2>
                    <p>Your safety is our top priority. Follow these guidelines for a safe volunteering experience:</p>
                    <h3>Before You Volunteer</h3>
                    <ul>
                        <li>Verify the organization is legitimate</li>
                        <li>Read all safety requirements for the opportunity</li>
                        <li>Ensure you have necessary vaccinations or health clearances</li>
                        <li>Know the location and have transportation arranged</li>
                    </ul>
                    <h3>During Your Volunteer Work</h3>
                    <ul>
                        <li>Always check in with the volunteer coordinator</li>
                        <li>Follow all safety protocols and use required equipment</li>
                        <li>Stay with your assigned group or partner</li>
                        <li>Report any concerns immediately</li>
                    </ul>
                    """,
                    "order": 1
                },
                {
                    "title": "Professional Boundaries",
                    "content": """
                    <h2>Maintaining Professional Boundaries</h2>
                    <p>Volunteering involves working with diverse communities. Here's how to maintain appropriate boundaries:</p>
                    <h3>Key Principles</h3>
                    <ul>
                        <li><strong>Respect Privacy:</strong> Keep client information confidential</li>
                        <li><strong>Stay Professional:</strong> Maintain appropriate relationships</li>
                        <li><strong>Know Your Limits:</strong> Don't exceed your training or role</li>
                        <li><strong>Follow Guidelines:</strong> Adhere to organization policies</li>
                    </ul>
                    """,
                    "order": 2
                }
            ]
        }
    ]

    # Create courses for hosts
    host_courses = [
        {
            "title": "Hosting Successful Volunteer Opportunities",
            "description": "Learn how to create, manage, and optimize volunteer opportunities that attract skilled volunteers and create meaningful impact.",
            "category": "host",
            "estimated_hours": 2,
            "modules": [
                {
                    "title": "Creating Compelling Opportunities",
                    "content": """
                    <h2>Designing Volunteer Opportunities That Attract Top Talent</h2>
                    <p>Creating clear, engaging opportunity listings is crucial for attracting the right volunteers.</p>
                    <h3>Essential Elements</h3>
                    <ul>
                        <li><strong>Clear Title:</strong> Be specific about the role and impact</li>
                        <li><strong>Detailed Description:</strong> Explain the work and its importance</li>
                        <li><strong>Required Skills:</strong> List both required and nice-to-have skills</li>
                        <li><strong>Time Commitment:</strong> Be transparent about expectations</li>
                        <li><strong>Impact Statement:</strong> Show how volunteers make a difference</li>
                    </ul>
                    <h3>Writing Tips</h3>
                    <ul>
                        <li>Use action verbs and concrete examples</li>
                        <li>Highlight learning and growth opportunities</li>
                        <li>Include photos or videos of your work</li>
                        <li>Share success stories from past volunteers</li>
                    </ul>
                    """,
                    "order": 1
                },
                {
                    "title": "Volunteer Management Best Practices",
                    "content": """
                    <h2>Building a Successful Volunteer Program</h2>
                    <p>Effective volunteer management ensures positive experiences and lasting impact.</p>
                    <h3>Key Components</h3>
                    <ul>
                        <li><strong>Onboarding:</strong> Provide orientation and training</li>
                        <li><strong>Communication:</strong> Keep volunteers informed and engaged</li>
                        <li><strong>Recognition:</strong> Celebrate contributions and milestones</li>
                        <li><strong>Feedback:</strong> Create channels for two-way communication</li>
                    </ul>
                    <h3>Creating Structure</h3>
                    <ul>
                        <li>Define clear roles and responsibilities</li>
                        <li>Set measurable goals and outcomes</li>
                        <li>Provide necessary resources and support</li>
                        <li>Establish regular check-ins and evaluations</li>
                    </ul>
                    """,
                    "order": 2
                },
                {
                    "title": "Impact Measurement and Reporting",
                    "content": """
                    <h2>Measuring and Communicating Your Impact</h2>
                    <p>Tracking and sharing your impact helps attract volunteers, funders, and community support.</p>
                    <h3>What to Measure</h3>
                    <ul>
                        <li>Volunteer hours contributed</li>
                        <li>Number of people served</li>
                        <li>Specific outcomes achieved</li>
                        <li>Skills developed by volunteers</li>
                    </ul>
                    <h3>Sharing Your Story</h3>
                    <ul>
                        <li>Create impact reports with data and stories</li>
                        <li>Share volunteer testimonials</li>
                        <li>Document before-and-after transformations</li>
                        <li>Celebrate milestones publicly</li>
                    </ul>
                    """,
                    "order": 3
                }
            ]
        },
        {
            "title": "Legal and Risk Management for Volunteer Programs",
            "description": "Understanding legal requirements, insurance needs, and risk management strategies for volunteer programs.",
            "category": "host",
            "estimated_hours": 1.5,
            "modules": [
                {
                    "title": "Legal Considerations",
                    "content": """
                    <h2>Legal Framework for Volunteer Programs</h2>
                    <p>Understanding legal requirements helps protect both your organization and volunteers.</p>
                    <h3>Key Legal Areas</h3>
                    <ul>
                        <li><strong>Volunteer vs. Employee:</strong> Understand the distinction</li>
                        <li><strong>Background Checks:</strong> When and how to conduct them</li>
                        <li><strong>Waivers and Agreements:</strong> Essential documentation</li>
                        <li><strong>Youth Volunteers:</strong> Special considerations for minors</li>
                    </ul>
                    <h3>Documentation Essentials</h3>
                    <ul>
                        <li>Volunteer agreements outlining expectations</li>
                        <li>Emergency contact information</li>
                        <li>Liability waivers where appropriate</li>
                        <li>Confidentiality agreements if needed</li>
                    </ul>
                    """,
                    "order": 1
                },
                {
                    "title": "Insurance and Risk Management",
                    "content": """
                    <h2>Protecting Your Organization and Volunteers</h2>
                    <p>Proper insurance and risk management are essential for sustainable volunteer programs.</p>
                    <h3>Insurance Considerations</h3>
                    <ul>
                        <li><strong>General Liability:</strong> Basic coverage for volunteer activities</li>
                        <li><strong>Volunteer Accident Insurance:</strong> Medical coverage for injuries</li>
                        <li><strong>Directors & Officers:</strong> Protection for volunteer leaders</li>
                        <li><strong>Auto Insurance:</strong> Coverage for volunteer drivers</li>
                    </ul>
                    <h3>Risk Management Strategies</h3>
                    <ul>
                        <li>Conduct risk assessments for all activities</li>
                        <li>Provide proper training and supervision</li>
                        <li>Maintain safe work environments</li>
                        <li>Have emergency procedures in place</li>
                    </ul>
                    """,
                    "order": 2
                }
            ]
        }
    ]

    # Create all courses
    all_courses = volunteer_courses + host_courses
    
    for course_data in all_courses:
        # Create course
        course = Course.objects.create(
            title=course_data["title"],
            slug=slugify(course_data["title"]),
            description=course_data["description"],
            category=course_data["category"],
            estimated_hours=course_data["estimated_hours"],
            is_published=True
        )
        
        # Create modules
        for module_data in course_data["modules"]:
            Module.objects.create(
                course=course,
                title=module_data["title"],
                content=module_data["content"],
                order=module_data["order"]
            )
        
        print(f"Created course: {course.title}")

    # Create a general course accessible to all
    general_course = Course.objects.create(
        title="Introduction to Community Service",
        slug="introduction-to-community-service",
        description="An overview of community service, its importance, and how to get involved.",
        category="general",
        estimated_hours=0.5,
        is_published=True
    )
    
    Module.objects.create(
        course=general_course,
        title="Why Community Service Matters",
        content="""
        <h2>The Power of Community Service</h2>
        <p>Community service is more than just volunteering—it's about creating lasting change and building stronger communities.</p>
        <h3>Benefits of Community Service</h3>
        <ul>
            <li><strong>Personal Growth:</strong> Develop new skills and perspectives</li>
            <li><strong>Community Impact:</strong> Address real needs in your area</li>
            <li><strong>Social Connection:</strong> Meet like-minded individuals</li>
            <li><strong>Career Development:</strong> Gain experience and references</li>
        </ul>
        <h3>Getting Started</h3>
        <p>Whether you're a first-time volunteer or an experienced organization, MishMob makes it easy to connect and create impact. Explore our platform to find opportunities that match your interests and availability.</p>
        """,
        order=1
    )
    
    print(f"Created course: {general_course.title}")
    print(f"\nSuccessfully created {len(all_courses) + 1} courses!")

if __name__ == "__main__":
    create_courses()