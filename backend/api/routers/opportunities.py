from ninja import Router, Query
from typing import List, Optional, Dict
from datetime import date
from pydantic import BaseModel
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, F, FloatField, Value
from django.db.models.functions import Cast
from opportunities.models import Opportunity, OpportunityHost, Role, RoleSkill
from users.models import Skill, UserSkill
from ninja.responses import Response
from django.db import transaction
from api.auth import jwt_auth, optional_jwt_auth

router = Router(tags=["Opportunities"])


# Test endpoint
@router.post("test", response={200: dict})
def test_post(request):
    """Test POST endpoint"""
    return {"message": "POST test successful"}


class OpportunityResponse(BaseModel):
    id: str
    title: str
    organization: str
    description: str
    location: str
    location_zip: str
    commitment: str
    skills: List[str]
    spots_available: int
    rating: float
    image: Optional[str] = None
    start_date: date
    end_date: date
    status: str
    is_remote: bool
    featured: bool
    match_score: Optional[float] = None  # Skill match percentage


class OpportunityListResponse(BaseModel):
    results: List[OpportunityResponse]
    total: int
    page: int
    page_size: int


@router.get("/", response=OpportunityListResponse)
def list_opportunities(
    request,
    zip_code: Optional[str] = None,
    skills: Optional[str] = None,  # This now acts as a general search term
    search: Optional[str] = None,  # Alternative parameter name for clarity
    cause_area: Optional[str] = None,
    remote_only: Optional[bool] = None,
    status: str = "open",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """List and search opportunities with filters"""
    
    # Start with base queryset
    queryset = Opportunity.objects.select_related('host').prefetch_related('roles__role_skills__skill')
    
    # Apply filters
    if status:
        queryset = queryset.filter(status=status)
    
    if zip_code:
        queryset = queryset.filter(location_zip=zip_code)
    
    if cause_area:
        queryset = queryset.filter(cause_area=cause_area)
    
    if remote_only is not None and remote_only:
        queryset = queryset.filter(is_remote=True)
    
    # Filter by skills or search term (use 'search' parameter or fall back to 'skills')
    search_param = search or skills
    if search_param:
        # Split comma-separated search terms
        search_terms = [s.strip() for s in search_param.split(',') if s.strip()]
        if search_terms:
            # Search in opportunity title, description, and skill names
            from django.db.models import Q
            search_queries = Q()
            for term in search_terms:
                search_queries |= (
                    Q(title__icontains=term) |  # Search in title
                    Q(description__icontains=term) |  # Search in description
                    Q(roles__role_skills__skill__name__icontains=term) |  # Search in skill names
                    Q(host__organization_name__icontains=term)  # Search in organization name
                )
            queryset = queryset.filter(search_queries).distinct()
    
    # Calculate pagination
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    # Get user's skills if authenticated volunteer
    user_skills_set = set()
    if hasattr(request, 'auth') and request.auth and request.auth.user_type == 'volunteer':
        user_skills = request.auth.user_skills.select_related('skill').all()
        user_skills_set = {skill.skill.name for skill in user_skills}
    
    opportunities = []
    for opp in queryset[start:end]:
        # Get total spots available across all roles
        total_spots = sum(role.slots_available - role.slots_filled for role in opp.roles.all())
        
        # Get required skills
        skills_list = []
        for role in opp.roles.all():
            for role_skill in role.role_skills.filter(skill_type='required'):
                skills_list.append(role_skill.skill.name)
        
        # Calculate match score if user has skills
        match_score = None
        if user_skills_set:
            match_score = calculate_skill_match(opp, user_skills_set)
        
        opportunities.append(OpportunityResponse(
            id=str(opp.id),
            title=opp.title,
            organization=opp.host.organization_name,
            description=opp.description[:200] + "..." if len(opp.description) > 200 else opp.description,
            location=f"{opp.location_name}",
            location_zip=opp.location_zip,
            commitment=opp.time_commitment,
            skills=list(set(skills_list))[:3],  # Show up to 3 unique skills
            spots_available=total_spots,
            rating=float(opp.host.rating_average),
            start_date=opp.start_date,
            end_date=opp.end_date,
            status=opp.status,
            is_remote=opp.is_remote,
            featured=opp.featured,
            match_score=match_score
        ))
    
    return OpportunityListResponse(
        results=opportunities,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("featured", response=List[OpportunityResponse])
def get_featured_opportunities(request):
    """Get featured opportunities for homepage"""
    
    queryset = Opportunity.objects.select_related('host').prefetch_related(
        'roles__role_skills__skill'
    ).filter(status='open', featured=True)[:6]
    
    opportunities = []
    for opp in queryset:
        # Get total spots available across all roles
        total_spots = sum(role.slots_available - role.slots_filled for role in opp.roles.all())
        
        # Get required skills
        skills_list = []
        for role in opp.roles.all():
            for role_skill in role.role_skills.filter(skill_type='required'):
                skills_list.append(role_skill.skill.name)
        
        opportunities.append(OpportunityResponse(
            id=str(opp.id),
            title=opp.title,
            organization=opp.host.organization_name,
            description=opp.description[:200] + "..." if len(opp.description) > 200 else opp.description,
            location=f"{opp.location_name}",
            location_zip=opp.location_zip,
            commitment=opp.time_commitment,
            skills=list(set(skills_list))[:3],
            spots_available=total_spots,
            rating=float(opp.host.rating_average),
            start_date=opp.start_date,
            end_date=opp.end_date,
            status=opp.status,
            is_remote=opp.is_remote,
            featured=opp.featured
        ))
    
    return opportunities


class OpportunityDetailResponse(BaseModel):
    id: str
    title: str
    organization: str
    organization_id: int
    description: str
    location_name: str
    location_address: str
    location_zip: str
    is_remote: bool
    cause_area: str
    start_date: date
    end_date: date
    time_commitment: str
    impact_statement: str
    requirements: str
    status: str
    featured: bool
    view_count: int
    roles: List[dict]
    host_info: dict


@router.get("{opportunity_id}", response=OpportunityDetailResponse)
def get_opportunity_detail(request, opportunity_id: str):
    """Get detailed opportunity information"""
    
    opportunity = get_object_or_404(
        Opportunity.objects.select_related('host').prefetch_related(
            'roles__role_skills__skill'
        ),
        id=opportunity_id
    )
    
    # Increment view count
    opportunity.view_count += 1
    opportunity.save(update_fields=['view_count'])
    
    # Get roles with skills
    roles_data = []
    for role in opportunity.roles.all():
        required_skills = []
        developed_skills = []
        
        for role_skill in role.role_skills.all():
            skill_data = {
                'name': role_skill.skill.name,
                'category': role_skill.skill.category
            }
            if role_skill.skill_type == 'required':
                required_skills.append(skill_data)
            elif role_skill.skill_type == 'developed':
                developed_skills.append(skill_data)
        
        roles_data.append({
            'id': role.id,
            'title': role.title,
            'description': role.description,
            'responsibilities': role.responsibilities,
            'slots_available': role.slots_available,
            'slots_filled': role.slots_filled,
            'time_commitment': role.time_commitment,
            'is_leadership': role.is_leadership,
            'required_skills': required_skills,
            'developed_skills': developed_skills
        })
    
    # Host info
    host_info = {
        'id': opportunity.host.id,
        'name': opportunity.host.organization_name,
        'website': opportunity.host.website,
        'description': opportunity.host.description,
        'is_verified': opportunity.host.is_verified,
        'rating_average': float(opportunity.host.rating_average),
        'rating_count': opportunity.host.rating_count
    }
    
    return OpportunityDetailResponse(
        id=str(opportunity.id),
        title=opportunity.title,
        organization=opportunity.host.organization_name,
        organization_id=opportunity.host.id,
        description=opportunity.description,
        location_name=opportunity.location_name,
        location_address=opportunity.location_address,
        location_zip=opportunity.location_zip,
        is_remote=opportunity.is_remote,
        cause_area=opportunity.cause_area,
        start_date=opportunity.start_date,
        end_date=opportunity.end_date,
        time_commitment=opportunity.time_commitment,
        impact_statement=opportunity.impact_statement,
        requirements=opportunity.requirements,
        status=opportunity.status,
        featured=opportunity.featured,
        view_count=opportunity.view_count,
        roles=roles_data,
        host_info=host_info
    )


class CreateOpportunityRequest(BaseModel):
    title: str
    description: str
    cause_area: str
    start_date: date
    end_date: date
    location_name: str
    location_address: str
    location_zip: str
    is_remote: bool = False
    impact_statement: str
    requirements: str = ""
    time_commitment: str
    roles: List[dict]  # Each role should have title, description, slots_available, required_skills


class ApplyRequest(BaseModel):
    role_id: int
    cover_letter: Optional[str] = None
    availability_notes: Optional[str] = None


@router.post("{opportunity_id}/apply", auth=jwt_auth)
def apply_to_opportunity(request, opportunity_id: str, data: ApplyRequest):
    """Apply to an opportunity role"""
    
    user = request.auth
    
    if user.user_type != 'volunteer':
        return Response({"error": "Only volunteers can apply"}, status=403)
    
    # Get opportunity and role
    opportunity = get_object_or_404(Opportunity, id=opportunity_id, status='open')
    role = get_object_or_404(Role, id=data.role_id, opportunity=opportunity)
    
    # Check if already applied
    from opportunities.models import Application
    if Application.objects.filter(volunteer=user, role=role).exists():
        return Response({"error": "Already applied to this role"}, status=400)
    
    # Check if slots available
    if role.slots_filled >= role.slots_available:
        return Response({"error": "No slots available for this role"}, status=400)
    
    # Create application
    application = Application.objects.create(
        volunteer=user,
        role=role,
        opportunity=opportunity,
        cover_letter=data.cover_letter or '',
        availability_notes=data.availability_notes or ''
    )
    
    return {
        "message": "Application submitted successfully",
        "application_id": application.id
    }


@router.post("", response={200: dict, 400: dict, 401: dict, 403: dict}, auth=jwt_auth)
def create_opportunity(request, data: CreateOpportunityRequest):
    """Create a new opportunity (host users only)"""
    
    user = request.auth
    
    if user.user_type != 'host':
        return 403, {"error": "Only host users can create opportunities"}
    
    # Get or create host profile
    try:
        host_profile = user.host_profile
    except OpportunityHost.DoesNotExist:
        return 400, {"error": "Host profile not found. Please complete your organization profile first."}
    
    # Validate dates
    if data.end_date < data.start_date:
        return 400, {"error": "End date must be after start date"}
    
    try:
        with transaction.atomic():
            # Create opportunity
            opportunity = Opportunity.objects.create(
                host=host_profile,
                title=data.title,
                description=data.description,
                cause_area=data.cause_area,
                start_date=data.start_date,
                end_date=data.end_date,
                location_name=data.location_name,
                location_address=data.location_address,
                location_zip=data.location_zip,
                is_remote=data.is_remote,
                impact_statement=data.impact_statement,
                requirements=data.requirements,
                time_commitment=data.time_commitment,
                status='draft'  # Start as draft
            )
            
            # Create roles
            for role_data in data.roles:
                role = Role.objects.create(
                    opportunity=opportunity,
                    title=role_data.get('title'),
                    description=role_data.get('description', ''),
                    responsibilities=role_data.get('responsibilities', ''),
                    slots_available=role_data.get('slots_available', 1),
                    time_commitment=role_data.get('time_commitment', data.time_commitment)
                )
                
                # Add required skills
                for skill_name in role_data.get('required_skills', []):
                    skill, created = Skill.objects.get_or_create(
                        name=skill_name,
                        defaults={'category': 'general'}
                    )
                    RoleSkill.objects.create(
                        role=role,
                        skill=skill,
                        skill_type='required'
                    )
                
                # Add skills to be developed
                for skill_name in role_data.get('developed_skills', []):
                    skill, created = Skill.objects.get_or_create(
                        name=skill_name,
                        defaults={'category': 'general'}
                    )
                    RoleSkill.objects.create(
                        role=role,
                        skill=skill,
                        skill_type='developed'
                    )
            
            return 200, {
                "message": "Opportunity created successfully",
                "opportunity_id": str(opportunity.id),
                "status": opportunity.status
            }
            
    except Exception as e:
        return 400, {"error": f"Failed to create opportunity: {str(e)}"}


@router.post("{opportunity_id}/publish", response={200: dict, 400: dict, 401: dict, 403: dict}, auth=jwt_auth)
def publish_opportunity(request, opportunity_id: str):
    """Publish a draft opportunity (make it visible to volunteers)"""
    
    user = request.auth
    
    opportunity = get_object_or_404(Opportunity, id=opportunity_id)
    
    # Check ownership
    if opportunity.host.user != user:
        return 403, {"error": "You don't have permission to publish this opportunity"}
    
    # Check if already published
    if opportunity.status != 'draft':
        return 400, {"error": f"Cannot publish opportunity with status: {opportunity.status}"}
    
    # Validate opportunity has at least one role
    if not opportunity.roles.exists():
        return 400, {"error": "Opportunity must have at least one role before publishing"}
    
    opportunity.status = 'open'
    opportunity.save()
    
    return 200, {
        "message": "Opportunity published successfully",
        "opportunity_id": str(opportunity.id)
    }


def calculate_skill_match(opportunity, user_skills_set):
    """Calculate skill match percentage between user and opportunity"""
    if not user_skills_set:
        return 0.0
    
    required_skills = set()
    for role in opportunity.roles.all():
        for role_skill in role.role_skills.filter(skill_type='required'):
            required_skills.add(role_skill.skill.name.lower())
    
    if not required_skills:
        return 0.0
    
    # Convert user skills to lowercase for comparison
    user_skills_lower = {skill.lower() for skill in user_skills_set}
    
    # Calculate match percentage
    matches = required_skills.intersection(user_skills_lower)
    match_percentage = (len(matches) / len(required_skills)) * 100
    
    return round(match_percentage, 1)


@router.get("recommendations", response=OpportunityListResponse, auth=jwt_auth)
def get_recommendations(
    request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Get personalized opportunity recommendations based on user skills"""
    
    user = request.auth
    
    # Get user's skills
    user_skills = UserSkill.objects.filter(user=user).select_related('skill')
    user_skills_set = {us.skill.name for us in user_skills}
    
    if not user_skills_set:
        # If user has no skills, return featured opportunities
        return list_opportunities(request, status='open', page=page, page_size=page_size)
    
    # Get all open opportunities
    queryset = Opportunity.objects.select_related('host').prefetch_related(
        'roles__role_skills__skill'
    ).filter(status='open')
    
    # Calculate match scores for each opportunity
    opportunities_with_scores = []
    for opp in queryset:
        match_score = calculate_skill_match(opp, user_skills_set)
        if match_score > 0:  # Only include opportunities with some skill match
            opportunities_with_scores.append((opp, match_score))
    
    # Sort by match score (descending)
    opportunities_with_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Apply pagination
    total = len(opportunities_with_scores)
    start = (page - 1) * page_size
    end = start + page_size
    
    results = []
    for opp, match_score in opportunities_with_scores[start:end]:
        # Get total spots available across all roles
        total_spots = sum(role.slots_available - role.slots_filled for role in opp.roles.all())
        
        # Get required skills
        skills_list = []
        for role in opp.roles.all():
            for role_skill in role.role_skills.filter(skill_type='required'):
                skills_list.append(role_skill.skill.name)
        
        results.append(OpportunityResponse(
            id=str(opp.id),
            title=opp.title,
            organization=opp.host.organization_name,
            description=opp.description[:200] + "..." if len(opp.description) > 200 else opp.description,
            location=f"{opp.location_name}",
            location_zip=opp.location_zip,
            commitment=opp.time_commitment,
            skills=list(set(skills_list))[:3],
            spots_available=total_spots,
            rating=float(opp.host.rating_average),
            start_date=opp.start_date,
            end_date=opp.end_date,
            status=opp.status,
            is_remote=opp.is_remote,
            featured=opp.featured,
            match_score=match_score
        ))
    
    return OpportunityListResponse(
        results=results,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("{opportunity_id}/match-score", response={200: dict}, auth=jwt_auth)
def get_match_score(request, opportunity_id: str):
    """Get skill match score for a specific opportunity"""
    
    user = request.auth
    opportunity = get_object_or_404(Opportunity, id=opportunity_id)
    
    # Get user's skills
    user_skills = UserSkill.objects.filter(user=user).select_related('skill')
    user_skills_set = {us.skill.name for us in user_skills}
    
    match_score = calculate_skill_match(opportunity, user_skills_set)
    
    # Get detailed match info
    required_skills = []
    matched_skills = []
    missing_skills = []
    
    for role in opportunity.roles.all():
        for role_skill in role.role_skills.filter(skill_type='required'):
            skill_name = role_skill.skill.name
            required_skills.append(skill_name)
            if skill_name.lower() in {s.lower() for s in user_skills_set}:
                matched_skills.append(skill_name)
            else:
                missing_skills.append(skill_name)
    
    return {
        "match_score": match_score,
        "required_skills": list(set(required_skills)),
        "matched_skills": list(set(matched_skills)),
        "missing_skills": list(set(missing_skills)),
        "user_has_skills": len(user_skills_set) > 0
    }