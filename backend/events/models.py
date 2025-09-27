from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid
import secrets

from opportunities.models import Opportunity

User = get_user_model()


class Event(models.Model):
    """
    Physical events that verified volunteers can attend.
    Extends opportunities with check-in capabilities.
    """
    
    opportunity = models.OneToOneField(
        Opportunity,
        on_delete=models.CASCADE,
        related_name='event'
    )
    
    # Event-specific settings
    max_attendees = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Maximum number of attendees allowed"
    )
    check_in_opens_at = models.DateTimeField(
        help_text="When check-in becomes available"
    )
    check_in_closes_at = models.DateTimeField(
        help_text="When check-in is no longer allowed"
    )
    
    # Security settings
    require_device_registration = models.BooleanField(
        default=True,
        help_text="Whether attendees must register their devices"
    )
    allow_multiple_devices = models.BooleanField(
        default=False,
        help_text="Whether users can register multiple devices"
    )
    qr_rotation_seconds = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(30)],
        help_text="How often QR codes rotate (minimum 30 seconds)"
    )
    
    # Check-in settings
    allow_early_check_in_minutes = models.PositiveIntegerField(
        default=30,
        help_text="Minutes before event start to allow check-in"
    )
    allow_late_check_in_minutes = models.PositiveIntegerField(
        default=60,
        help_text="Minutes after event start to allow check-in"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['check_in_opens_at', 'check_in_closes_at']),
        ]
    
    def __str__(self):
        return f"Event: {self.opportunity.title}"
    
    def is_check_in_open(self):
        """Check if check-in is currently allowed"""
        now = timezone.now()
        return self.check_in_opens_at <= now <= self.check_in_closes_at
    
    def get_checked_in_count(self):
        """Get count of checked-in attendees"""
        return self.tickets.filter(checked_in_at__isnull=False).count()


class EventTicket(models.Model):
    """
    Represents a verified user's ticket to an event.
    Server-side only - no sensitive data exposed to clients.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_tickets')
    
    # Security token - never exposed to client
    server_token = models.CharField(
        max_length=64, 
        unique=True, 
        editable=False,
        help_text="Secret token for server-side validation"
    )
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active'
    )
    
    # Registration tracking
    registered_at = models.DateTimeField(auto_now_add=True)
    registered_device = models.ForeignKey(
        'DeviceRegistration',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    
    # Check-in tracking
    checked_in_at = models.DateTimeField(null=True, blank=True)
    check_in_device = models.ForeignKey(
        'DeviceRegistration',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='check_ins'
    )
    checked_in_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_checked_in'
    )
    
    # Metadata
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = [['event', 'user']]
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['server_token']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event}"
    
    def save(self, *args, **kwargs):
        if not self.server_token:
            # Generate cryptographically secure token
            self.server_token = secrets.token_urlsafe(48)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """Check if ticket is valid for check-in"""
        if self.status != 'active':
            return False
        if self.checked_in_at:
            return False
        if not self.event.is_check_in_open():
            return False
        # Verify user is still verified
        try:
            profile = self.user.userprofile
            return profile.is_verified
        except:
            return False


class DeviceRegistration(models.Model):
    """
    Registered devices for users to prevent ticket sharing.
    Stores device fingerprints securely.
    """
    
    DEVICE_TYPE_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web Browser'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)
    device_name = models.CharField(max_length=100)
    
    # Security fingerprint - combination of device characteristics
    # For mobile: device ID + app instance ID
    # For web: browser fingerprint + secure cookie
    device_fingerprint_hash = models.CharField(
        max_length=64,
        unique=True,
        help_text="SHA256 hash of device fingerprint"
    )
    
    # Trust tracking
    is_trusted = models.BooleanField(default=False)
    trust_established_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    
    # Push notification token (optional)
    push_token = models.CharField(max_length=255, blank=True)
    
    registered_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['device_fingerprint_hash']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.device_name}"


class CheckIn(models.Model):
    """
    Immutable audit log of all check-in attempts.
    Records both successful and failed attempts for security analysis.
    """
    
    RESULT_CHOICES = [
        ('success', 'Success'),
        ('invalid_token', 'Invalid Token'),
        ('expired_token', 'Expired Token'),
        ('already_checked_in', 'Already Checked In'),
        ('invalid_device', 'Invalid Device'),
        ('ticket_cancelled', 'Ticket Cancelled'),
        ('user_not_verified', 'User Not Verified'),
        ('check_in_closed', 'Check-In Closed'),
        ('unknown_error', 'Unknown Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What was scanned
    scanned_data = models.TextField(
        help_text="Raw data from QR code"
    )
    
    # Who/what performed the scan
    scanner_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='scans_performed'
    )
    scanner_device = models.ForeignKey(
        DeviceRegistration,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scans_performed'
    )
    
    # What was found
    ticket = models.ForeignKey(
        EventTicket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='check_in_attempts'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='check_in_attempts'
    )
    
    # Result
    result = models.CharField(max_length=30, choices=RESULT_CHOICES)
    result_message = models.TextField(blank=True)
    
    # Location data (optional)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, 
        null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, 
        null=True, blank=True
    )
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event', 'result', 'created_at']),
            models.Index(fields=['ticket', 'created_at']),
            models.Index(fields=['scanner_user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.event} - {self.result} at {self.created_at}"