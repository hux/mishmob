from ninja import Router, Query
from typing import List, Optional
from datetime import date
from pydantic import BaseModel
from django.shortcuts import get_object_or_404
from opportunities.models import Opportunity, OpportunityHost, Role
from ninja.responses import Response

router = Router(tags=["Opportunities"])


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


class OpportunityListResponse(BaseModel):
    results: List[OpportunityResponse]
    total: int
    page: int
    page_size: int


@router.get("/", response=OpportunityListResponse)
def list_opportunities(
    request,
    zip_code: Optional[str] = None,
    skills: Optional[str] = None,
    cause_area: Optional[str] = None,
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
    
    # TODO: Implement skills filter
    
    # Calculate pagination
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    opportunities = []
    for opp in queryset[start:end]:
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
            skills=list(set(skills_list))[:3],  # Show up to 3 unique skills
            spots_available=total_spots,
            rating=float(opp.host.rating_average),
            start_date=opp.start_date,
            end_date=opp.end_date,
            status=opp.status,
            is_remote=opp.is_remote,
            featured=opp.featured
        ))
    
    return OpportunityListResponse(
        results=opportunities,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/featured", response=List[OpportunityResponse])
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


@router.get("/{opportunity_id}", response=OpportunityDetailResponse)
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


class ApplyRequest(BaseModel):
    role_id: int
    cover_letter: Optional[str] = None
    availability_notes: Optional[str] = None


@router.post("/{opportunity_id}/apply")
def apply_to_opportunity(request, opportunity_id: str, data: ApplyRequest):
    """Apply to an opportunity role"""
    
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)
    
    if request.user.user_type != 'volunteer':
        return Response({"error": "Only volunteers can apply"}, status=403)
    
    # Get opportunity and role
    opportunity = get_object_or_404(Opportunity, id=opportunity_id, status='open')
    role = get_object_or_404(Role, id=data.role_id, opportunity=opportunity)
    
    # Check if already applied
    from opportunities.models import Application
    if Application.objects.filter(volunteer=request.user, role=role).exists():
        return Response({"error": "Already applied to this role"}, status=400)
    
    # Check if slots available
    if role.slots_filled >= role.slots_available:
        return Response({"error": "No slots available for this role"}, status=400)
    
    # Create application
    application = Application.objects.create(
        volunteer=request.user,
        role=role,
        opportunity=opportunity,
        cover_letter=data.cover_letter or '',
        availability_notes=data.availability_notes or ''
    )
    
    return {
        "message": "Application submitted successfully",
        "application_id": application.id
    }