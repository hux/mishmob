"""
Event check-in API endpoints with enterprise-grade security.
"""

from typing import List, Optional
from datetime import datetime
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from ninja import Router, Schema
from ninja.responses import Response
from pydantic import BaseModel, Field
import qrcode
import io
import base64
import logging

from api.auth import jwt_auth
from events.models import Event, EventTicket, DeviceRegistration, CheckIn
from events.utils import SecureTokenGenerator, CheckInValidator
from opportunities.models import Opportunity
from users.models import UserProfile

logger = logging.getLogger(__name__)

router = Router()


# Request/Response Schemas
class EventRegistrationRequest(BaseModel):
    device_fingerprint: Optional[str] = Field(None, description="Device fingerprint for registration")
    device_name: Optional[str] = Field(None, description="Friendly device name")
    device_type: Optional[str] = Field(None, description="Device type: ios, android, web")


class EventTicketResponse(BaseModel):
    ticket_id: str
    event_title: str
    event_date: datetime
    location: str
    status: str
    registered_at: datetime
    check_in_opens_at: datetime
    check_in_closes_at: datetime
    is_checked_in: bool
    checked_in_at: Optional[datetime]


class QRCodeResponse(BaseModel):
    qr_code_base64: str
    expires_at: datetime
    valid_seconds: int


class DeviceRegistrationResponse(BaseModel):
    device_id: str
    device_name: str
    device_type: str
    is_trusted: bool
    registered_at: datetime


class CheckInRequest(BaseModel):
    qr_token: str
    device_fingerprint: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CheckInResponse(BaseModel):
    success: bool
    message: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    event_title: Optional[str] = None


# Event Registration Endpoints
@router.post("/opportunities/{opportunity_id}/register-for-event", response=EventTicketResponse, auth=jwt_auth)
def register_for_event(request, opportunity_id: str, registration: EventRegistrationRequest):
    """
    Register a verified user for an event.
    Requires user to be verified and opportunity to have an associated event.
    """
    user = request.user
    
    # Check user verification
    try:
        profile = user.profile
        if not profile.is_verified:
            return Response({"error": "User verification required to register for events"}, status=403)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=404)
    
    # Get opportunity and event
    opportunity = get_object_or_404(Opportunity, id=opportunity_id)
    try:
        event = opportunity.event
    except Event.DoesNotExist:
        return Response({"error": "This opportunity does not have check-in enabled"}, status=400)
    
    # Check if already registered
    if EventTicket.objects.filter(event=event, user=user).exists():
        return Response({"error": "Already registered for this event"}, status=400)
    
    # Check capacity
    if event.max_attendees:
        current_registrations = event.tickets.filter(status='active').count()
        if current_registrations >= event.max_attendees:
            return Response({"error": "Event is at capacity"}, status=400)
    
    with transaction.atomic():
        # Handle device registration if provided
        device = None
        if registration.device_fingerprint and event.require_device_registration:
            fingerprint_hash = SecureTokenGenerator.generate_device_fingerprint({
                'device_id': registration.device_fingerprint,
                'user_id': str(user.id),
                'device_type': registration.device_type or 'unknown',
            })
            
            device, created = DeviceRegistration.objects.get_or_create(
                device_fingerprint_hash=fingerprint_hash,
                defaults={
                    'user': user,
                    'device_type': registration.device_type or 'web',
                    'device_name': registration.device_name or 'Unknown Device',
                }
            )
            
            if not created and device.user != user:
                return Response({"error": "Device registered to another user"}, status=400)
        
        # Create ticket
        ticket = EventTicket.objects.create(
            event=event,
            user=user,
            registered_device=device,
        )
        
        logger.info(f"User {user.username} registered for event {event.opportunity.title}")
    
    return EventTicketResponse(
        ticket_id=str(ticket.id),
        event_title=opportunity.title,
        event_date=opportunity.start_date,
        location=opportunity.location_name,
        status=ticket.status,
        registered_at=ticket.registered_at,
        check_in_opens_at=event.check_in_opens_at,
        check_in_closes_at=event.check_in_closes_at,
        is_checked_in=bool(ticket.checked_in_at),
        checked_in_at=ticket.checked_in_at,
    )


@router.get("/events/my-tickets", response=List[EventTicketResponse], auth=jwt_auth)
def get_my_tickets(request):
    """Get all event tickets for the authenticated user."""
    tickets = EventTicket.objects.filter(
        user=request.user,
        status='active'
    ).select_related('event__opportunity').order_by('-event__opportunity__start_date')
    
    return [
        EventTicketResponse(
            ticket_id=str(ticket.id),
            event_title=ticket.event.opportunity.title,
            event_date=ticket.event.opportunity.start_date,
            location=ticket.event.opportunity.location_name,
            status=ticket.status,
            registered_at=ticket.registered_at,
            check_in_opens_at=ticket.event.check_in_opens_at,
            check_in_closes_at=ticket.event.check_in_closes_at,
            is_checked_in=bool(ticket.checked_in_at),
            checked_in_at=ticket.checked_in_at,
        )
        for ticket in tickets
    ]


@router.get("/tickets/{ticket_id}/qr-code", response=QRCodeResponse, auth=jwt_auth)
def generate_qr_code(request, ticket_id: str):
    """
    Generate a time-limited QR code for event check-in.
    QR codes rotate based on event settings.
    """
    # Get ticket and verify ownership
    ticket = get_object_or_404(EventTicket, id=ticket_id)
    if ticket.user != request.user:
        return Response({"error": "Not authorized to access this ticket"}, status=403)
    
    # Check basic ticket validity (but allow QR generation even when check-in is closed)
    if ticket.status != 'active':
        return Response({"error": "Ticket is not active"}, status=400)
    
    if ticket.checked_in_at:
        return Response({"error": "Ticket already used"}, status=400)
    
    # Verify user is still verified
    try:
        profile = ticket.user.profile
        if not profile.is_verified:
            return Response({"error": "User verification required"}, status=400)
    except:
        return Response({"error": "User profile not found"}, status=400)
    
    try:
        # Generate secure token
        token_data = SecureTokenGenerator.generate_qr_token(
            ticket_id=str(ticket.id),
            user_id=request.user.id
        )
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(token_data['token'])
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return QRCodeResponse(
            qr_code_base64=f"data:image/png;base64,{qr_base64}",
            expires_at=datetime.fromisoformat(token_data['expires_at']),
            valid_seconds=token_data['valid_seconds'],
        )
        
    except ValueError as e:
        return Response({"error": str(e)}, status=429)  # Rate limit
    except Exception as e:
        logger.error(f"QR generation error: {str(e)}")
        return Response({"error": "Failed to generate QR code"}, status=500)


# Device Management Endpoints
@router.get("/devices", response=List[DeviceRegistrationResponse], auth=jwt_auth)
def get_my_devices(request):
    """Get all registered devices for the authenticated user."""
    devices = DeviceRegistration.objects.filter(
        user=request.user,
        is_active=True
    ).order_by('-registered_at')
    
    return [
        DeviceRegistrationResponse(
            device_id=str(device.id),
            device_name=device.device_name,
            device_type=device.device_type,
            is_trusted=device.is_trusted,
            registered_at=device.registered_at,
        )
        for device in devices
    ]


@router.delete("/devices/{device_id}", auth=jwt_auth)
def remove_device(request, device_id: str):
    """Remove a registered device."""
    device = get_object_or_404(DeviceRegistration, id=device_id, user=request.user)
    device.is_active = False
    device.save()
    
    return {"success": True, "message": "Device removed successfully"}


# Check-in Endpoints (for event staff/scanners)
@router.post("/events/check-in", response=CheckInResponse, auth=jwt_auth)
def check_in_attendee(request, check_in_data: CheckInRequest):
    """
    Validate QR code and check in an attendee.
    Only authorized event staff can perform check-ins.
    """
    scanner_user = request.user
    
    # Validate scanner permissions
    # TODO: Add proper role-based access control for event staff
    # For now, we'll check if user is a host
    if not hasattr(scanner_user, 'host_profile'):
        return Response({"error": "Not authorized to perform check-ins"}, status=403)
    
    # Record all check-in attempts for audit
    check_in_record = CheckIn(
        scanned_data=check_in_data.qr_token[:500],  # Truncate for safety
        scanner_user=scanner_user,
        latitude=check_in_data.latitude,
        longitude=check_in_data.longitude,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )
    
    # Validate token
    ticket_id, error = SecureTokenGenerator.validate_qr_token(
        check_in_data.qr_token,
        scanner_user.id
    )
    
    if error:
        check_in_record.result = 'invalid_token'
        check_in_record.result_message = error
        check_in_record.save()
        return CheckInResponse(success=False, message=error)
    
    # Get ticket
    try:
        ticket = EventTicket.objects.select_related(
            'event__opportunity', 'user', 'registered_device'
        ).get(id=ticket_id)
    except EventTicket.DoesNotExist:
        check_in_record.result = 'invalid_token'
        check_in_record.result_message = "Ticket not found"
        check_in_record.save()
        return CheckInResponse(success=False, message="Invalid ticket")
    
    check_in_record.ticket = ticket
    check_in_record.event = ticket.event
    
    # Validate check-in
    is_valid, error_message = CheckInValidator.validate_check_in(
        ticket, 
        ticket.event,
        ticket.registered_device if check_in_data.device_fingerprint else None
    )
    
    if not is_valid:
        # Map error messages to result codes
        result_map = {
            "Already checked in": "already_checked_in",
            "Ticket is not active": "ticket_cancelled",
            "User verification required": "user_not_verified",
            "Check-in is not open": "check_in_closed",
        }
        check_in_record.result = result_map.get(error_message, "unknown_error")
        check_in_record.result_message = error_message
        check_in_record.save()
        return CheckInResponse(success=False, message=error_message)
    
    # Perform check-in
    with transaction.atomic():
        ticket.checked_in_at = timezone.now()
        ticket.checked_in_by = scanner_user
        ticket.save()
        
        check_in_record.result = 'success'
        check_in_record.result_message = "Successfully checked in"
        check_in_record.save()
        
        logger.info(
            f"User {ticket.user.username} checked in to {ticket.event.opportunity.title} "
            f"by {scanner_user.username}"
        )
    
    return CheckInResponse(
        success=True,
        message="Check-in successful",
        user_name=ticket.user.get_full_name() or ticket.user.username,
        user_email=ticket.user.email,
        event_title=ticket.event.opportunity.title,
    )


@router.get("/events/{event_id}/attendees", auth=jwt_auth)
def get_event_attendees(request, event_id: str):
    """
    Get list of checked-in attendees for an event.
    Only event hosts can access this.
    """
    event = get_object_or_404(Event, id=event_id)
    
    # Check permissions
    if not hasattr(request.user, 'host_profile'):
        return Response({"error": "Not authorized"}, status=403)
    
    if event.opportunity.host != request.user.host_profile:
        return Response({"error": "Not authorized for this event"}, status=403)
    
    attendees = EventTicket.objects.filter(
        event=event,
        checked_in_at__isnull=False
    ).select_related('user').order_by('-checked_in_at')
    
    return {
        "event_title": event.opportunity.title,
        "total_registered": event.tickets.filter(status='active').count(),
        "total_checked_in": attendees.count(),
        "attendees": [
            {
                "name": ticket.user.get_full_name() or ticket.user.username,
                "email": ticket.user.email,
                "checked_in_at": ticket.checked_in_at.isoformat(),
            }
            for ticket in attendees
        ]
    }


@router.get("/events/{event_id}/check-in-stats", auth=jwt_auth)
def get_check_in_stats(request, event_id: str):
    """
    Get check-in statistics and recent activity for an event.
    Only event hosts can access this.
    """
    event = get_object_or_404(Event, id=event_id)
    
    # Check permissions
    if not hasattr(request.user, 'host_profile'):
        return Response({"error": "Not authorized"}, status=403)
    
    if event.opportunity.host != request.user.host_profile:
        return Response({"error": "Not authorized for this event"}, status=403)
    
    # Get stats
    from django.db.models import Count, Q
    stats = CheckIn.objects.filter(event=event).aggregate(
        total_scans=Count('id'),
        successful_scans=Count('id', filter=Q(result='success')),
        failed_scans=Count('id', filter=~Q(result='success')),
    )
    
    # Get recent activity
    recent_attempts = CheckIn.objects.filter(
        event=event
    ).select_related('ticket__user', 'scanner_user').order_by('-created_at')[:20]
    
    return {
        "event_title": event.opportunity.title,
        "stats": stats,
        "recent_activity": [
            {
                "timestamp": attempt.created_at.isoformat(),
                "result": attempt.result,
                "scanner": attempt.scanner_user.username if attempt.scanner_user else "Unknown",
                "attendee": attempt.ticket.user.username if attempt.ticket else "Unknown",
            }
            for attempt in recent_attempts
        ]
    }