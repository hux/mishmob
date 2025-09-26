from ninja import Router
from typing import List, Optional
from pydantic import BaseModel
from django.shortcuts import get_object_or_404
from users.models import Skill, UserSkill, User
from api.auth import jwt_auth

router = Router(tags=["Skills"])


class SkillResponse(BaseModel):
    id: int
    name: str
    category: str


class UserSkillResponse(BaseModel):
    id: int
    skill: SkillResponse
    proficiency_level: Optional[str] = None
    is_verified: bool = False


class AddSkillRequest(BaseModel):
    skill_name: str
    proficiency_level: Optional[str] = "intermediate"


class RemoveSkillRequest(BaseModel):
    skill_id: int


@router.get("/all", response=List[SkillResponse])
def list_all_skills(request):
    """Get all available skills"""
    skills = Skill.objects.all().order_by('category', 'name')
    return [
        SkillResponse(
            id=skill.id,
            name=skill.name,
            category=skill.category
        )
        for skill in skills
    ]


@router.get("/search", response=List[SkillResponse])
def search_skills(request, q: str):
    """Search for skills by name"""
    if len(q) < 2:
        return []
    
    skills = Skill.objects.filter(name__icontains=q)[:20]
    return [
        SkillResponse(
            id=skill.id,
            name=skill.name,
            category=skill.category
        )
        for skill in skills
    ]


@router.get("/my-skills", response=List[UserSkillResponse], auth=jwt_auth)
def get_my_skills(request):
    """Get current user's skills"""
    user = request.auth
    user_skills = UserSkill.objects.filter(user=user).select_related('skill')
    
    return [
        UserSkillResponse(
            id=us.id,
            skill=SkillResponse(
                id=us.skill.id,
                name=us.skill.name,
                category=us.skill.category
            ),
            proficiency_level=us.proficiency_level,
            is_verified=us.is_verified
        )
        for us in user_skills
    ]


@router.post("/add", response={200: dict, 400: dict}, auth=jwt_auth)
def add_skill(request, data: AddSkillRequest):
    """Add a skill to user's profile"""
    user = request.auth
    
    # Get or create the skill
    skill, created = Skill.objects.get_or_create(
        name=data.skill_name,
        defaults={'category': 'general'}
    )
    
    # Check if user already has this skill
    if UserSkill.objects.filter(user=user, skill=skill).exists():
        return 400, {"error": "You already have this skill"}
    
    # Add the skill
    user_skill = UserSkill.objects.create(
        user=user,
        skill=skill,
        proficiency_level=data.proficiency_level
    )
    
    return 200, {
        "message": "Skill added successfully",
        "skill": {
            "id": user_skill.id,
            "name": skill.name,
            "proficiency_level": user_skill.proficiency_level
        }
    }


@router.post("/remove", response={200: dict, 400: dict}, auth=jwt_auth)
def remove_skill(request, data: RemoveSkillRequest):
    """Remove a skill from user's profile"""
    user = request.auth
    
    try:
        user_skill = UserSkill.objects.get(user=user, skill_id=data.skill_id)
        user_skill.delete()
        return 200, {"message": "Skill removed successfully"}
    except UserSkill.DoesNotExist:
        return 400, {"error": "Skill not found in your profile"}


@router.post("/update-proficiency", response={200: dict, 400: dict}, auth=jwt_auth)
def update_skill_proficiency(request, skill_id: int, proficiency_level: str):
    """Update proficiency level for a skill"""
    user = request.auth
    
    valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
    if proficiency_level not in valid_levels:
        return 400, {"error": f"Invalid proficiency level. Must be one of: {', '.join(valid_levels)}"}
    
    try:
        user_skill = UserSkill.objects.get(user=user, skill_id=skill_id)
        user_skill.proficiency_level = proficiency_level
        user_skill.save()
        return 200, {"message": "Proficiency level updated successfully"}
    except UserSkill.DoesNotExist:
        return 400, {"error": "Skill not found in your profile"}


@router.get("/popular", response=List[dict])
def get_popular_skills(request, limit: int = 10):
    """Get most popular skills based on usage"""
    from django.db.models import Count
    
    popular_skills = Skill.objects.annotate(
        user_count=Count('userskill')
    ).order_by('-user_count')[:limit]
    
    return [
        {
            "skill": SkillResponse(
                id=skill.id,
                name=skill.name,
                category=skill.category
            ),
            "user_count": skill.user_count
        }
        for skill in popular_skills
    ]


@router.get("/categories", response=List[str])
def get_skill_categories(request):
    """Get all skill categories"""
    categories = Skill.objects.values_list('category', flat=True).distinct()
    return list(categories)