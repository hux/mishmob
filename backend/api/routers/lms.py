from typing import List, Optional
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, Prefetch
from django.db import transaction
from django.utils import timezone
from ninja import Router, Schema, File, UploadedFile
from ninja.pagination import paginate
from ninja.errors import HttpError
from pydantic import BaseModel

from lms.models import (
    Course, Module, Enrollment, ModuleProgress, 
    Quiz, Question, Answer, QuizAttempt, QuizAnswer, Certificate
)
from api.auth import jwt_auth

router = Router()


# Request/Response Schemas
class ModuleSchema(BaseModel):
    id: int
    title: str
    content_type: str
    duration: int
    display_order: int
    is_completed: Optional[bool] = False
    quiz_id: Optional[int] = None


class CourseListSchema(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    audience_type: str
    difficulty_level: str
    estimated_duration: int
    category: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: bool
    is_enrolled: bool = False
    progress_percentage: Optional[int] = None
    modules_count: int
    enrolled_count: int


class CourseDetailSchema(CourseListSchema):
    created_by: Optional[str] = None
    created_at: datetime
    modules: List[ModuleSchema]
    provides_certificate: bool
    passing_score: int
    tags: Optional[str] = None


class CreateCourseRequest(BaseModel):
    title: str
    description: str
    audience_type: str
    difficulty_level: str = 'beginner'
    estimated_duration: int
    category: Optional[str] = None
    tags: Optional[str] = None
    provides_certificate: bool = True
    passing_score: int = 80


class CreateModuleRequest(BaseModel):
    title: str
    content: str
    content_type: str = 'text'
    video_url: Optional[str] = None
    duration: int
    display_order: int


class QuestionSchema(BaseModel):
    id: int
    question_text: str
    question_type: str
    points: int
    order: int
    answers: Optional[List[dict]] = None


class QuizSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    passing_score: int
    max_attempts: int
    time_limit_minutes: Optional[int] = None
    questions_count: int
    total_points: int


class CreateQuizRequest(BaseModel):
    title: str
    description: Optional[str] = None
    passing_score: int = 70
    max_attempts: int = 3
    time_limit_minutes: Optional[int] = None
    randomize_questions: bool = False
    show_correct_answers: bool = True


class CreateQuestionRequest(BaseModel):
    question_text: str
    question_type: str
    points: int = 1
    order: int = 0
    explanation: Optional[str] = None
    answers: List[dict]  # [{"answer_text": "...", "is_correct": true/false}]


class EnrollmentSchema(BaseModel):
    course_id: str
    course_title: str
    enrolled_at: datetime
    completion_status: str
    progress_percentage: int
    last_accessed: Optional[datetime] = None
    certificate_issued: bool
    certificate_id: Optional[str] = None


class ProgressUpdateRequest(BaseModel):
    module_id: int
    completed: bool
    time_spent_seconds: Optional[int] = None


class QuizAttemptSchema(BaseModel):
    id: int
    quiz_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: Optional[float] = None
    passed: Optional[bool] = None
    remaining_attempts: int


class SubmitQuizRequest(BaseModel):
    answers: List[dict]  # [{"question_id": 1, "answer_id": 2, "text_answer": "..."}]


class CertificateSchema(BaseModel):
    certificate_id: str
    user_name: str
    course_title: str
    completion_date: str
    issued_date: datetime
    final_score: Optional[float] = None
    verification_url: str


# Course endpoints
@router.get("/courses", response=List[CourseListSchema])
def list_courses(
    request,
    audience_type: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None
):
    """List all published courses with filters"""
    # Allow unauthenticated browsing
    user = getattr(request, 'auth', None)
    
    courses = Course.objects.filter(is_active=True, is_published=True)
    
    # Apply filters
    if audience_type:
        courses = courses.filter(Q(audience_type=audience_type) | Q(audience_type='both'))
    
    if category:
        courses = courses.filter(category__icontains=category)
    
    if difficulty:
        courses = courses.filter(difficulty_level=difficulty)
    
    if search:
        courses = courses.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(tags__icontains=search)
        )
    
    # Get user's enrollments (if authenticated)
    if user:
        user_enrollments = set(
            Enrollment.objects.filter(user=user).values_list('course_id', flat=True)
        )
    else:
        user_enrollments = set()
    
    # Annotate with counts
    courses = courses.annotate(
        modules_count=Count('modules'),
        enrolled_count=Count('enrollments', filter=Q(enrollments__completion_status__in=['active', 'completed']))
    )
    
    # Build response
    course_list = []
    for course in courses:
        enrollment = None
        if user and str(course.id) in user_enrollments:
            try:
                enrollment = Enrollment.objects.get(user=user, course=course)
            except Enrollment.DoesNotExist:
                pass
        
        course_list.append(CourseListSchema(
            id=str(course.id),
            title=course.title,
            slug=course.slug,
            description=course.description,
            audience_type=course.audience_type,
            difficulty_level=course.difficulty_level,
            estimated_duration=course.estimated_duration,
            category=course.category,
            thumbnail_url=course.thumbnail.url if course.thumbnail else None,
            is_published=course.is_published,
            is_enrolled=str(course.id) in user_enrollments,
            progress_percentage=enrollment.progress_percentage if enrollment else None,
            modules_count=course.modules_count,
            enrolled_count=course.enrolled_count
        ))
    
    return course_list


@router.get("/courses/{course_id}", response=CourseDetailSchema)
def get_course_detail(request, course_id: str):
    """Get detailed course information"""
    # Allow unauthenticated browsing
    user = getattr(request, 'auth', None)
    
    course = get_object_or_404(
        Course.objects.prefetch_related('modules'),
        id=course_id,
        is_active=True
    )
    
    # Check enrollment (if authenticated)
    enrollment = None
    module_progress = {}
    if user:
        try:
            enrollment = Enrollment.objects.get(user=user, course=course)
            module_progress = {
                mp.module_id: mp.completed
                for mp in enrollment.module_progress.all()
            }
        except Enrollment.DoesNotExist:
            pass
    
    # Build modules list
    modules = []
    for module in course.modules.all():
        quiz_id = None
        if hasattr(module, 'quiz'):
            quiz_id = module.quiz.id
        
        modules.append(ModuleSchema(
            id=module.id,
            title=module.title,
            content_type=module.content_type,
            duration=module.duration,
            display_order=module.display_order,
            is_completed=module_progress.get(module.id, False),
            quiz_id=quiz_id
        ))
    
    return CourseDetailSchema(
        id=str(course.id),
        title=course.title,
        slug=course.slug,
        description=course.description,
        audience_type=course.audience_type,
        difficulty_level=course.difficulty_level,
        estimated_duration=course.estimated_duration,
        category=course.category,
        thumbnail_url=course.thumbnail.url if course.thumbnail else None,
        is_published=course.is_published,
        is_enrolled=enrollment is not None,
        progress_percentage=enrollment.progress_percentage if enrollment else None,
        modules_count=course.modules.count(),
        enrolled_count=course.enrollments.filter(
            completion_status__in=['active', 'completed']
        ).count(),
        created_by=course.created_by.get_full_name() if course.created_by else None,
        created_at=course.created_at,
        modules=modules,
        provides_certificate=course.provides_certificate,
        passing_score=course.passing_score,
        tags=course.tags
    )


@router.post("/courses", response={201: dict}, auth=jwt_auth)
def create_course(request, data: CreateCourseRequest):
    """Create a new course (admin/staff only)"""
    user = request.auth
    
    if not user.is_staff:
        raise HttpError(403, "Only staff can create courses")
    
    course = Course.objects.create(
        title=data.title,
        description=data.description,
        audience_type=data.audience_type,
        difficulty_level=data.difficulty_level,
        estimated_duration=data.estimated_duration,
        category=data.category or '',
        tags=data.tags or '',
        provides_certificate=data.provides_certificate,
        passing_score=data.passing_score,
        created_by=user
    )
    
    return {"message": "Course created successfully", "course_id": str(course.id)}


# Module endpoints
@router.post("/courses/{course_id}/modules", response={201: dict}, auth=jwt_auth)
def create_module(request, course_id: str, data: CreateModuleRequest):
    """Add a module to a course"""
    user = request.auth
    
    course = get_object_or_404(Course, id=course_id)
    
    # Check permissions
    if not user.is_staff and course.created_by != user:
        raise HttpError(403, "You don't have permission to modify this course")
    
    module = Module.objects.create(
        course=course,
        title=data.title,
        content=data.content,
        content_type=data.content_type,
        video_url=data.video_url or '',
        duration=data.duration,
        display_order=data.display_order
    )
    
    return {"message": "Module created successfully", "module_id": module.id}


@router.get("/modules/{module_id}", response=dict, auth=jwt_auth)
def get_module_content(request, module_id: int):
    """Get module content for enrolled users"""
    user = request.auth
    
    module = get_object_or_404(Module, id=module_id)
    
    # Check enrollment
    enrollment = get_object_or_404(
        Enrollment,
        user=user,
        course=module.course,
        completion_status__in=['active', 'completed']
    )
    
    # Get or create progress
    progress, _ = ModuleProgress.objects.get_or_create(
        enrollment=enrollment,
        module=module
    )
    
    # Update last accessed
    enrollment.last_accessed = timezone.now()
    enrollment.save()
    
    return {
        "module": {
            "id": module.id,
            "title": module.title,
            "content": module.content,
            "content_type": module.content_type,
            "video_url": module.video_url,
            "duration": module.duration,
        },
        "progress": {
            "completed": progress.completed,
            "time_spent": progress.time_spent,
            "quiz_score": progress.quiz_score,
        },
        "has_quiz": hasattr(module, 'quiz')
    }


# Enrollment endpoints
@router.post("/courses/{course_id}/enroll", response={201: dict}, auth=jwt_auth)
def enroll_in_course(request, course_id: str):
    """Enroll in a course"""
    user = request.auth
    
    course = get_object_or_404(Course, id=course_id, is_active=True, is_published=True)
    
    # Check if already enrolled
    if Enrollment.objects.filter(user=user, course=course).exists():
        raise HttpError(400, "You are already enrolled in this course")
    
    enrollment = Enrollment.objects.create(
        user=user,
        course=course
    )
    
    return {
        "message": "Successfully enrolled in course",
        "enrollment_id": enrollment.id
    }


@router.get("/enrollments", response=List[EnrollmentSchema], auth=jwt_auth)
def get_my_enrollments(request, status: Optional[str] = None):
    """Get user's course enrollments"""
    user = request.auth
    
    enrollments = Enrollment.objects.filter(user=user).select_related('course')
    
    if status:
        enrollments = enrollments.filter(completion_status=status)
    
    enrollment_list = []
    for enrollment in enrollments:
        certificate_id = None
        if hasattr(enrollment, 'certificate'):
            certificate_id = str(enrollment.certificate.certificate_id)
        
        enrollment_list.append(EnrollmentSchema(
            course_id=str(enrollment.course.id),
            course_title=enrollment.course.title,
            enrolled_at=enrollment.enrollment_date,
            completion_status=enrollment.completion_status,
            progress_percentage=enrollment.progress_percentage,
            last_accessed=enrollment.last_accessed,
            certificate_issued=enrollment.certificate_issued,
            certificate_id=certificate_id
        ))
    
    return enrollment_list


@router.post("/progress/update", response={200: dict}, auth=jwt_auth)
def update_progress(request, data: ProgressUpdateRequest):
    """Update module progress"""
    user = request.auth
    
    module = get_object_or_404(Module, id=data.module_id)
    enrollment = get_object_or_404(
        Enrollment,
        user=user,
        course=module.course,
        completion_status__in=['not_started', 'in_progress']
    )
    
    with transaction.atomic():
        progress, created = ModuleProgress.objects.get_or_create(
            enrollment=enrollment,
            module=module
        )
        
        progress.completed = data.completed
        if data.completed:
            progress.completed_at = timezone.now()
        
        if data.time_spent_seconds:
            progress.time_spent += data.time_spent_seconds
        
        progress.save()
        
        # Update enrollment progress
        enrollment.update_progress()
        
        # Check if course completed and issue certificate
        if enrollment.completion_status == 'completed' and enrollment.course.provides_certificate:
            if not hasattr(enrollment, 'certificate'):
                Certificate.objects.create(
                    enrollment=enrollment,
                    user_name=user.get_full_name() or user.username,
                    course_title=enrollment.course.title,
                    completion_date=timezone.now().date(),
                    final_score=calculate_final_score(enrollment)
                )
                enrollment.certificate_issued = True
                enrollment.save()
    
    return {
        "message": "Progress updated",
        "course_progress": enrollment.progress_percentage,
        "course_completed": enrollment.completion_status == 'completed'
    }


# Quiz endpoints
@router.get("/modules/{module_id}/quiz", response=QuizSchema, auth=jwt_auth)
def get_quiz(request, module_id: int):
    """Get quiz for a module"""
    user = request.auth
    
    module = get_object_or_404(Module, id=module_id)
    quiz = get_object_or_404(Quiz, module=module)
    
    # Check enrollment
    enrollment = get_object_or_404(
        Enrollment,
        user=user,
        course=module.course
    )
    
    # Count questions and total points
    questions = quiz.questions.all()
    total_points = sum(q.points for q in questions)
    
    return QuizSchema(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        passing_score=quiz.passing_score,
        max_attempts=quiz.max_attempts,
        time_limit_minutes=quiz.time_limit_minutes,
        questions_count=questions.count(),
        total_points=total_points
    )


@router.get("/quizzes/{quiz_id}/questions", response=List[QuestionSchema], auth=jwt_auth)
def get_quiz_questions(request, quiz_id: int):
    """Get questions for a quiz"""
    user = request.auth
    
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    # Check enrollment
    enrollment = get_object_or_404(
        Enrollment,
        user=user,
        course=quiz.module.course
    )
    
    # Get or create attempt
    attempts_count = QuizAttempt.objects.filter(
        enrollment=enrollment,
        quiz=quiz
    ).count()
    
    if quiz.max_attempts > 0 and attempts_count >= quiz.max_attempts:
        raise HttpError(400, "Maximum attempts reached")
    
    questions = quiz.questions.prefetch_related('answers').all()
    
    if quiz.randomize_questions:
        questions = questions.order_by('?')
    
    question_list = []
    for question in questions:
        answers = None
        if question.question_type in ['multiple_choice', 'true_false']:
            answers = [
                {
                    "id": ans.id,
                    "answer_text": ans.answer_text,
                    "order": ans.order
                }
                for ans in question.answers.all()
            ]
        
        question_list.append(QuestionSchema(
            id=question.id,
            question_text=question.question_text,
            question_type=question.question_type,
            points=question.points,
            order=question.order,
            answers=answers
        ))
    
    return question_list


@router.post("/quizzes/{quiz_id}/start", response=QuizAttemptSchema, auth=jwt_auth)
def start_quiz_attempt(request, quiz_id: int):
    """Start a new quiz attempt"""
    user = request.auth
    
    quiz = get_object_or_404(Quiz, id=quiz_id)
    enrollment = get_object_or_404(
        Enrollment,
        user=user,
        course=quiz.module.course
    )
    
    # Check attempt limit
    attempts_count = QuizAttempt.objects.filter(
        enrollment=enrollment,
        quiz=quiz
    ).count()
    
    if quiz.max_attempts > 0 and attempts_count >= quiz.max_attempts:
        raise HttpError(400, "Maximum attempts reached")
    
    # Create attempt
    attempt = QuizAttempt.objects.create(
        enrollment=enrollment,
        quiz=quiz
    )
    
    remaining = quiz.max_attempts - attempts_count - 1 if quiz.max_attempts > 0 else -1
    
    return QuizAttemptSchema(
        id=attempt.id,
        quiz_id=quiz.id,
        started_at=attempt.started_at,
        completed_at=None,
        score=None,
        passed=None,
        remaining_attempts=remaining
    )


@router.post("/attempts/{attempt_id}/submit", response={200: dict}, auth=jwt_auth)
def submit_quiz(request, attempt_id: int, data: SubmitQuizRequest):
    """Submit quiz answers"""
    user = request.auth
    
    attempt = get_object_or_404(
        QuizAttempt,
        id=attempt_id,
        enrollment__user=user,
        completed_at__isnull=True
    )
    
    with transaction.atomic():
        # Save answers
        for answer_data in data.answers:
            question = get_object_or_404(
                Question,
                id=answer_data['question_id'],
                quiz=attempt.quiz
            )
            
            quiz_answer = QuizAnswer.objects.create(
                attempt=attempt,
                question=question
            )
            
            # Check answer based on type
            if question.question_type in ['multiple_choice', 'true_false']:
                selected = get_object_or_404(Answer, id=answer_data['answer_id'])
                quiz_answer.selected_answer = selected
                quiz_answer.is_correct = selected.is_correct
                if selected.is_correct:
                    quiz_answer.points_earned = question.points
            elif question.question_type == 'short_answer':
                # Simple exact match for now
                quiz_answer.text_answer = answer_data.get('text_answer', '')
                correct_answers = question.answers.filter(is_correct=True)
                for correct in correct_answers:
                    if quiz_answer.text_answer.lower().strip() == correct.answer_text.lower().strip():
                        quiz_answer.is_correct = True
                        quiz_answer.points_earned = question.points
                        break
            
            quiz_answer.save()
        
        # Calculate score
        attempt.calculate_score()
        
        # Update module progress
        module_progress, _ = ModuleProgress.objects.get_or_create(
            enrollment=attempt.enrollment,
            module=attempt.quiz.module
        )
        module_progress.quiz_score = attempt.score
        if attempt.passed:
            module_progress.completed = True
            module_progress.completed_at = timezone.now()
        module_progress.save()
        
        # Update enrollment progress
        attempt.enrollment.update_progress()
    
    return {
        "score": float(attempt.score),
        "passed": attempt.passed,
        "passing_score": attempt.quiz.passing_score,
        "show_correct_answers": attempt.quiz.show_correct_answers
    }


# Certificate endpoints
@router.get("/certificates/{certificate_id}", response=CertificateSchema)
def get_certificate(request, certificate_id: str):
    """Get certificate details (public endpoint for verification)"""
    certificate = get_object_or_404(Certificate, certificate_id=certificate_id)
    
    return CertificateSchema(
        certificate_id=str(certificate.certificate_id),
        user_name=certificate.user_name,
        course_title=certificate.course_title,
        completion_date=certificate.completion_date.isoformat(),
        issued_date=certificate.issued_date,
        final_score=certificate.final_score,
        verification_url=certificate.get_verification_url()
    )


# Helper functions
def calculate_final_score(enrollment):
    """Calculate final score based on quiz scores"""
    quiz_scores = ModuleProgress.objects.filter(
        enrollment=enrollment,
        module__content_type='quiz',
        quiz_score__isnull=False
    ).values_list('quiz_score', flat=True)
    
    if quiz_scores:
        return sum(quiz_scores) / len(quiz_scores)
    return None