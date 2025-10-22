from ninja import Router
from typing import List, Optional
from pydantic import BaseModel
from django.shortcuts import get_object_or_404
from users.models import Skill, UserSkill, User
from api.auth import jwt_auth
from django.db.models import Count, Q

router = Router(tags=["Skills Assessment"])


class InterestArea(BaseModel):
    """Interest areas for skill suggestions"""
    id: str
    name: str
    icon: str
    description: str
    related_skills: List[str]


class SkillSuggestion(BaseModel):
    """Suggested skill with context"""
    id: str
    name: str
    category: str
    reason: str  # Why we're suggesting this
    popularity: int  # How many users have this skill
    is_common: bool  # Is this a "quick win" common skill


class AssessmentProgress(BaseModel):
    """User's progress through assessment"""
    step: int
    total_steps: int
    skills_added: int
    estimated_seconds_remaining: int


# Interest area definitions with skill mappings
INTEREST_AREAS = {
    'education': {
        'id': 'education',
        'name': 'Education & Mentoring',
        'icon': '🎓',
        'description': 'Teach, tutor, and guide others',
        'related_skills': [
            'Teaching', 'Tutoring', 'Mentoring', 'Curriculum Development',
            'Public Speaking', 'Child Care', 'Coaching', 'Training'
        ]
    },
    'environment': {
        'id': 'environment',
        'name': 'Environment & Sustainability',
        'icon': '🌱',
        'description': 'Protect nature and promote sustainability',
        'related_skills': [
            'Gardening', 'Environmental Science', 'Conservation',
            'Recycling', 'Urban Planning', 'Sustainability', 'Composting'
        ]
    },
    'health': {
        'id': 'health',
        'name': 'Health & Wellness',
        'icon': '🏥',
        'description': 'Support health and wellbeing',
        'related_skills': [
            'First Aid', 'CPR', 'Nursing', 'Mental Health Support',
            'Fitness Training', 'Nutrition', 'Medical Administration'
        ]
    },
    'community': {
        'id': 'community',
        'name': 'Community Building',
        'icon': '🏘️',
        'description': 'Strengthen neighborhoods and connections',
        'related_skills': [
            'Event Planning', 'Community Organizing', 'Fundraising',
            'Social Media', 'Marketing', 'Public Relations', 'Networking'
        ]
    },
    'arts': {
        'id': 'arts',
        'name': 'Arts & Culture',
        'icon': '🎨',
        'description': 'Create, perform, and inspire',
        'related_skills': [
            'Photography', 'Videography', 'Graphic Design', 'Music',
            'Dance', 'Writing', 'Painting', 'Theater', 'Crafts'
        ]
    },
    'technology': {
        'id': 'technology',
        'name': 'Technology & Innovation',
        'icon': '💻',
        'description': 'Build digital solutions',
        'related_skills': [
            'Web Development', 'Python', 'JavaScript', 'Data Analysis',
            'Social Media Management', 'IT Support', 'Coding', 'App Development'
        ]
    },
    'animals': {
        'id': 'animals',
        'name': 'Animals & Wildlife',
        'icon': '🐾',
        'description': 'Care for animals and habitats',
        'related_skills': [
            'Animal Care', 'Dog Walking', 'Pet Grooming', 'Veterinary Support',
            'Wildlife Conservation', 'Animal Training', 'Foster Care'
        ]
    },
    'food': {
        'id': 'food',
        'name': 'Food & Hunger Relief',
        'icon': '🍽️',
        'description': 'Feed and nourish communities',
        'related_skills': [
            'Cooking', 'Food Service', 'Catering', 'Nutrition',
            'Food Safety', 'Meal Planning', 'Kitchen Management'
        ]
    }
}

# Common "quick win" skills that most people have
COMMON_SKILLS = [
    'Communication', 'Teamwork', 'Problem Solving', 'Organization',
    'Customer Service', 'Time Management', 'Adaptability', 'Leadership',
    'Active Listening', 'Reliability', 'Enthusiasm', 'Empathy'
]


@router.get("/interest-areas", response=List[InterestArea])
def get_interest_areas(request):
    """Get all interest areas for initial selection"""
    return [
        InterestArea(
            id=area['id'],
            name=area['name'],
            icon=area['icon'],
            description=area['description'],
            related_skills=area['related_skills']
        )
        for area in INTEREST_AREAS.values()
    ]


@router.get("/common-skills", response=List[SkillSuggestion])
def get_common_skills(request):
    """Get common 'quick win' skills that most people have"""
    suggestions = []

    for skill_name in COMMON_SKILLS:
        # Get or create skill
        skill, _ = Skill.objects.get_or_create(
            name=skill_name,
            defaults={'category': 'social'}
        )

        # Count how many users have this skill
        user_count = UserSkill.objects.filter(skill=skill).count()

        suggestions.append(SkillSuggestion(
            id=str(skill.id),
            name=skill.name,
            category=skill.category,
            reason="A valuable skill for any volunteer",
            popularity=user_count,
            is_common=True
        ))

    return suggestions


@router.post("/suggest-skills", response=List[SkillSuggestion])
def suggest_skills_by_interests(request, interest_ids: List[str]):
    """
    Get skill suggestions based on selected interest areas

    Args:
        interest_ids: List of interest area IDs (e.g., ['education', 'technology'])
    """
    suggestions = []
    suggested_skill_names = set()

    # Collect skills from selected interest areas
    for interest_id in interest_ids:
        if interest_id not in INTEREST_AREAS:
            continue

        area = INTEREST_AREAS[interest_id]

        for skill_name in area['related_skills']:
            if skill_name in suggested_skill_names:
                continue

            suggested_skill_names.add(skill_name)

            # Get or create skill
            skill, created = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': _categorize_skill(skill_name)}
            )

            # Count how many users have this skill
            user_count = UserSkill.objects.filter(skill=skill).count()

            suggestions.append(SkillSuggestion(
                id=str(skill.id),
                name=skill.name,
                category=skill.category,
                reason=f"Popular in {area['name']}",
                popularity=user_count,
                is_common=False
            ))

    # Sort by popularity (most common first)
    suggestions.sort(key=lambda x: x.popularity, reverse=True)

    return suggestions


@router.post("/add-skills-batch", response={200: dict, 400: dict}, auth=jwt_auth)
def add_skills_batch(request, skills: List[dict]):
    """
    Add multiple skills at once from assessment wizard

    Args:
        skills: List of {skill_id, proficiency_level} objects

    Returns:
        Success message with count of skills added
    """
    user = request.auth
    added_count = 0
    skipped_count = 0

    for skill_data in skills:
        skill_id = skill_data.get('skill_id')
        proficiency = skill_data.get('proficiency_level', 'intermediate')

        try:
            skill = Skill.objects.get(id=skill_id)

            # Check if user already has this skill
            if UserSkill.objects.filter(user=user, skill=skill).exists():
                skipped_count += 1
                continue

            # Add the skill
            UserSkill.objects.create(
                user=user,
                skill=skill,
                proficiency_level=proficiency
            )
            added_count += 1

        except Skill.DoesNotExist:
            continue

    return 200, {
        "message": f"Successfully added {added_count} skills",
        "added": added_count,
        "skipped": skipped_count
    }


@router.post("/suggest-next-skills", response=List[SkillSuggestion], auth=jwt_auth)
def suggest_next_skills(request):
    """
    Suggest skills based on what the user already has
    Uses collaborative filtering: "Users with skill X also have skill Y"
    """
    user = request.auth

    # Get user's current skills
    user_skills = UserSkill.objects.filter(user=user).select_related('skill')
    user_skill_ids = [us.skill.id for us in user_skills]

    if not user_skill_ids:
        # No skills yet, return popular skills
        return _get_popular_skills(limit=15)

    # Find users with similar skills
    similar_users = UserSkill.objects.filter(
        skill_id__in=user_skill_ids
    ).values_list('user_id', flat=True).distinct()

    # Find skills that similar users have, but current user doesn't
    suggested_skills = Skill.objects.filter(
        user_skills__user_id__in=similar_users
    ).exclude(
        id__in=user_skill_ids
    ).annotate(
        user_count=Count('user_skills')
    ).order_by('-user_count')[:15]

    suggestions = []
    for skill in suggested_skills:
        suggestions.append(SkillSuggestion(
            id=str(skill.id),
            name=skill.name,
            category=skill.category,
            reason="Others with similar skills also have this",
            popularity=skill.user_count,
            is_common=skill.name in COMMON_SKILLS
        ))

    return suggestions


@router.get("/assessment-progress", response=AssessmentProgress, auth=jwt_auth)
def get_assessment_progress(request):
    """Get user's progress through skills assessment"""
    user = request.auth

    skills_count = UserSkill.objects.filter(user=user).count()

    # Estimate completion based on skills added
    if skills_count == 0:
        step = 1
        seconds_remaining = 90
    elif skills_count < 3:
        step = 2
        seconds_remaining = 75
    elif skills_count < 8:
        step = 3
        seconds_remaining = 50
    elif skills_count < 15:
        step = 4
        seconds_remaining = 20
    else:
        step = 5
        seconds_remaining = 10

    return AssessmentProgress(
        step=step,
        total_steps=5,
        skills_added=skills_count,
        estimated_seconds_remaining=seconds_remaining
    )


def _categorize_skill(skill_name: str) -> str:
    """Auto-categorize skill based on name"""
    skill_lower = skill_name.lower()

    tech_keywords = ['python', 'javascript', 'web', 'development', 'coding', 'it', 'data', 'app']
    if any(keyword in skill_lower for keyword in tech_keywords):
        return 'technical'

    creative_keywords = ['design', 'photo', 'video', 'art', 'music', 'writing', 'creative']
    if any(keyword in skill_lower for keyword in creative_keywords):
        return 'creative'

    leadership_keywords = ['management', 'leadership', 'organizing', 'planning', 'coordination']
    if any(keyword in skill_lower for keyword in leadership_keywords):
        return 'leadership'

    physical_keywords = ['sports', 'fitness', 'physical', 'construction', 'gardening']
    if any(keyword in skill_lower for keyword in physical_keywords):
        return 'physical'

    return 'social'


def _get_popular_skills(limit: int = 15) -> List[SkillSuggestion]:
    """Get most popular skills across platform"""
    popular_skills = Skill.objects.annotate(
        user_count=Count('user_skills')
    ).order_by('-user_count')[:limit]

    return [
        SkillSuggestion(
            id=str(skill.id),
            name=skill.name,
            category=skill.category,
            reason="Popular skill on MishMob",
            popularity=skill.user_count,
            is_common=skill.name in COMMON_SKILLS
        )
        for skill in popular_skills
    ]
