from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from opportunities.models import Opportunity, OpportunityHost, Role, RoleSkill
from users.models import Skill
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with sample opportunities'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create sample host users first
        host_users = []
        for i in range(5):
            username = f'host{i+1}'
            email = f'host{i+1}@example.com'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'user_type': 'host',
                    'first_name': f'Host{i+1}',
                    'last_name': 'User',
                    'is_active': True,
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'Created host user: {username}')
            host_users.append(user)

        # Create or get skills
        skill_data = [
            ('Python', 'Technical'),
            ('JavaScript', 'Technical'),
            ('React', 'Technical'),
            ('Django', 'Technical'),
            ('Project Management', 'Leadership'),
            ('Communication', 'Soft Skills'),
            ('Teaching', 'Education'),
            ('Mentoring', 'Education'),
            ('Data Analysis', 'Technical'),
            ('Graphic Design', 'Creative'),
            ('Content Writing', 'Creative'),
            ('Social Media', 'Marketing'),
            ('Event Planning', 'Operations'),
            ('Fundraising', 'Operations'),
            ('Community Outreach', 'Operations'),
        ]

        skills = {}
        for name, category in skill_data:
            skill, _ = Skill.objects.get_or_create(name=name, defaults={'category': category})
            skills[name] = skill

        # Create sample organizations
        org_data = [
            {
                'organization_name': 'Tech for Good Foundation',
                'website': 'https://techforgood.org',
                'description': 'Building technology solutions for social impact',
                'is_verified': True,
                'rating_average': 4.8,
                'rating_count': 125,
            },
            {
                'organization_name': 'Green Earth Initiative',
                'website': 'https://greenearth.org',
                'description': 'Environmental conservation and education programs',
                'is_verified': True,
                'rating_average': 4.6,
                'rating_count': 89,
            },
            {
                'organization_name': 'Youth Mentorship Alliance',
                'website': 'https://youthmentors.org',
                'description': 'Connecting mentors with at-risk youth',
                'is_verified': True,
                'rating_average': 4.9,
                'rating_count': 156,
            },
            {
                'organization_name': 'Community Food Bank',
                'website': 'https://communityfoodbank.org',
                'description': 'Fighting hunger in local communities',
                'is_verified': True,
                'rating_average': 4.7,
                'rating_count': 203,
            },
            {
                'organization_name': 'Digital Literacy Network',
                'website': 'https://digitallit.org',
                'description': 'Teaching digital skills to underserved populations',
                'is_verified': True,
                'rating_average': 4.5,
                'rating_count': 67,
            },
        ]

        organizations = []
        for i, org_info in enumerate(org_data):
            # Assign a host user to each organization
            user = host_users[i % len(host_users)]
            
            # Check if this user already has a host profile
            if hasattr(user, 'host_profile'):
                org = user.host_profile
                # Update the existing host profile
                for key, value in org_info.items():
                    setattr(org, key, value)
                org.save()
            else:
                org, _ = OpportunityHost.objects.get_or_create(
                    user=user,
                    defaults=org_info
                )
            organizations.append(org)

        # Create sample opportunities
        opportunity_templates = [
            {
                'title': 'Build Website for Local Nonprofit',
                'description': 'Help us create a modern, responsive website to increase our online presence and reach more community members. We need a complete redesign with donation integration and volunteer signup forms.',
                'location_name': 'Downtown Community Center',
                'location_address': '123 Main Street',
                'location_zip': '94105',
                'is_remote': False,
                'cause_area': 'Technology',
                'time_commitment': '10-15 hours/week',
                'impact_statement': 'Your work will help us reach 5000+ community members and increase donations by 30%',
                'requirements': 'Experience with web development and responsive design',
                'featured': True,
                'required_skills': ['JavaScript', 'React', 'Graphic Design'],
                'developed_skills': ['Project Management', 'Communication'],
            },
            {
                'title': 'Youth Coding Workshop Instructor',
                'description': 'Teach basic programming concepts to middle school students in an after-school program. Create fun, engaging lessons that inspire the next generation of coders.',
                'location_name': 'Lincoln Middle School',
                'location_address': '456 Education Blvd',
                'location_zip': '94110',
                'is_remote': False,
                'cause_area': 'Education',
                'time_commitment': '4 hours/week',
                'impact_statement': 'Inspire 20+ students to explore technology careers',
                'requirements': 'Programming experience and patience working with youth',
                'featured': True,
                'required_skills': ['Python', 'Teaching', 'Mentoring'],
                'developed_skills': ['Communication', 'Leadership'],
            },
            {
                'title': 'Environmental Data Analysis Project',
                'description': 'Analyze environmental data to help track and visualize local pollution levels. Create dashboards and reports for community advocacy.',
                'location_name': 'Remote',
                'location_address': 'N/A',
                'location_zip': '94102',
                'is_remote': True,
                'cause_area': 'Environment',
                'time_commitment': '5-10 hours/week',
                'impact_statement': 'Provide data-driven insights for environmental policy advocacy',
                'requirements': 'Experience with data analysis and visualization',
                'featured': False,
                'required_skills': ['Python', 'Data Analysis'],
                'developed_skills': ['Communication', 'Project Management'],
            },
            {
                'title': 'Social Media Campaign Manager',
                'description': 'Develop and execute social media strategies to raise awareness about hunger in our community and promote food drive events.',
                'location_name': 'Food Bank Headquarters',
                'location_address': '789 Charity Lane',
                'location_zip': '94103',
                'is_remote': True,
                'cause_area': 'Hunger',
                'time_commitment': '8 hours/week',
                'impact_statement': 'Help us reach 10,000+ followers and increase food donations',
                'requirements': 'Social media marketing experience',
                'featured': False,
                'required_skills': ['Social Media', 'Content Writing', 'Graphic Design'],
                'developed_skills': ['Project Management', 'Community Outreach'],
            },
            {
                'title': 'Grant Writing Volunteer',
                'description': 'Research and write grant proposals to secure funding for youth mentorship programs. Work with our team to identify opportunities and craft compelling narratives.',
                'location_name': 'Remote',
                'location_address': 'N/A',
                'location_zip': '94107',
                'is_remote': True,
                'cause_area': 'Youth',
                'time_commitment': '6-8 hours/week',
                'impact_statement': 'Secure funding to mentor 50+ at-risk youth',
                'requirements': 'Strong writing skills and attention to detail',
                'featured': True,
                'required_skills': ['Content Writing', 'Fundraising'],
                'developed_skills': ['Project Management', 'Communication'],
            },
            {
                'title': 'Community Garden Coordinator',
                'description': 'Lead weekend volunteer groups in maintaining and expanding our community garden. Organize planting schedules and teach sustainable gardening practices.',
                'location_name': 'Sunset Community Garden',
                'location_address': '321 Garden Way',
                'location_zip': '94116',
                'is_remote': False,
                'cause_area': 'Environment',
                'time_commitment': '8 hours/week',
                'impact_statement': 'Provide fresh produce for 100+ families',
                'requirements': 'Basic gardening knowledge and leadership skills',
                'featured': False,
                'required_skills': ['Event Planning', 'Community Outreach'],
                'developed_skills': ['Project Management', 'Teaching'],
            },
            {
                'title': 'Mobile App Developer for Food Rescue',
                'description': 'Build a mobile app to connect restaurants with food banks to reduce food waste. Features include pickup scheduling and impact tracking.',
                'location_name': 'Tech Hub',
                'location_address': '555 Innovation Drive',
                'location_zip': '94104',
                'is_remote': True,
                'cause_area': 'Hunger',
                'time_commitment': '15-20 hours/week',
                'impact_statement': 'Rescue 10,000+ pounds of food from waste',
                'requirements': 'Mobile development experience (React Native preferred)',
                'featured': True,
                'required_skills': ['JavaScript', 'React', 'Python'],
                'developed_skills': ['Project Management', 'Communication'],
            },
            {
                'title': 'Digital Skills Tutor for Seniors',
                'description': 'Teach basic computer and internet skills to senior citizens. Help them connect with family, access services, and navigate the digital world safely.',
                'location_name': 'Senior Community Center',
                'location_address': '999 Elder Care Blvd',
                'location_zip': '94108',
                'is_remote': False,
                'cause_area': 'Education',
                'time_commitment': '3-4 hours/week',
                'impact_statement': 'Empower 30+ seniors with essential digital skills',
                'requirements': 'Patience and basic computer knowledge',
                'featured': False,
                'required_skills': ['Teaching', 'Communication'],
                'developed_skills': ['Mentoring', 'Community Outreach'],
            },
        ]

        created_count = 0
        for i, template in enumerate(opportunity_templates):
            org = random.choice(organizations)
            
            # Calculate dates
            start_date = timezone.now().date() + timedelta(days=random.randint(7, 30))
            end_date = start_date + timedelta(days=random.randint(30, 180))
            
            # Create opportunity
            opportunity = Opportunity.objects.create(
                host=org,
                title=template['title'],
                description=template['description'],
                location_name=template['location_name'],
                location_address=template['location_address'],
                location_zip=template['location_zip'],
                is_remote=template['is_remote'],
                cause_area=template['cause_area'],
                start_date=start_date,
                end_date=end_date,
                time_commitment=template['time_commitment'],
                impact_statement=template['impact_statement'],
                requirements=template['requirements'],
                status='open',
                featured=template['featured'],
                view_count=random.randint(50, 500),
            )
            
            # Create roles
            role = Role.objects.create(
                opportunity=opportunity,
                title=f"{template['title']} Volunteer",
                description=template['description'],
                responsibilities='- ' + '\n- '.join([
                    'Collaborate with team members',
                    'Complete assigned tasks on schedule',
                    'Communicate progress regularly',
                    'Participate in team meetings',
                ]),
                slots_available=random.randint(3, 10),
                slots_filled=random.randint(0, 2),
                time_commitment=template['time_commitment'],
                is_leadership=False,
            )
            
            # Add required skills
            for skill_name in template['required_skills']:
                if skill_name in skills:
                    RoleSkill.objects.create(
                        role=role,
                        skill=skills[skill_name],
                        skill_type='required',
                        importance_level=random.choice(['high', 'medium'])
                    )
            
            # Add developed skills
            for skill_name in template['developed_skills']:
                if skill_name in skills:
                    RoleSkill.objects.create(
                        role=role,
                        skill=skills[skill_name],
                        skill_type='developed',
                        importance_level='medium'
                    )
            
            created_count += 1
            self.stdout.write(f'Created opportunity: {opportunity.title}')

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} opportunities'))