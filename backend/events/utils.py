"""
Secure token generation and validation utilities for event check-ins.
Implements defense against the vulnerabilities found in Ticketmaster's system.
"""

import hmac
import hashlib
import time
import jwt
import secrets
from datetime import datetime, timedelta, timezone as dt_timezone
from typing import Optional, Dict, Tuple
from django.conf import settings
from django.core.cache import cache


class SecureTokenGenerator:
    """
    Generates and validates secure, rotating tokens for event check-ins.
    
    Key security features:
    - Server-side only token generation
    - Short-lived tokens with strict expiration
    - HMAC-based integrity verification
    - Rate limiting and replay prevention
    - No sensitive data in client-visible tokens
    """
    
    # Token validity window (seconds)
    TOKEN_VALIDITY_SECONDS = 30
    GRACE_PERIOD_SECONDS = 5
    
    # Rate limiting - increased for mobile app auto-refresh
    MAX_GENERATION_PER_MINUTE = 60  # Allow 1 per second for auto-refresh
    MAX_VALIDATION_PER_MINUTE = 100
    
    @classmethod
    def generate_qr_token(cls, ticket_id: str, user_id: int) -> Dict[str, any]:
        """
        Generate a time-limited JWT token for QR code display.
        
        Returns a minimal JWT with only non-sensitive claims.
        The actual validation happens server-side using the ticket's server_token.
        """
        # Rate limiting check
        rate_key = f"qr_gen:{user_id}"
        attempts = cache.get(rate_key, 0)
        if attempts >= cls.MAX_GENERATION_PER_MINUTE:
            raise ValueError(f"Rate limit exceeded. Generated {attempts} QR codes in last minute. Max allowed: {cls.MAX_GENERATION_PER_MINUTE}. Please wait.")
        cache.set(rate_key, attempts + 1, 60)
        
        # Log for debugging
        if attempts > cls.MAX_GENERATION_PER_MINUTE * 0.8:  # Warn at 80% of limit
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"User {user_id} approaching QR generation rate limit: {attempts + 1}/{cls.MAX_GENERATION_PER_MINUTE}")
        
        # Generate expiration time
        now = datetime.now(dt_timezone.utc)
        expires_at = now + timedelta(seconds=cls.TOKEN_VALIDITY_SECONDS)
        
        # Create minimal JWT payload
        payload = {
            'ticket_id': str(ticket_id),
            'exp': int(expires_at.timestamp()),
            'iat': int(now.timestamp()),
            'jti': secrets.token_urlsafe(16),  # Unique token ID for replay prevention
        }
        
        # Sign with server secret (RS256 would be better for production)
        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # Store token ID for replay prevention
        cache.set(f"token_used:{payload['jti']}", True, cls.TOKEN_VALIDITY_SECONDS * 2)
        
        return {
            'token': token,
            'expires_at': expires_at.isoformat(),
            'valid_seconds': cls.TOKEN_VALIDITY_SECONDS,
        }
    
    @classmethod
    def validate_qr_token(cls, token: str, scanner_id: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Validate a QR token and return the ticket_id if valid.
        
        Returns: (ticket_id, error_message)
        """
        # Rate limiting for scanner
        rate_key = f"qr_val:{scanner_id}"
        attempts = cache.get(rate_key, 0)
        if attempts >= cls.MAX_VALIDATION_PER_MINUTE:
            return None, "Scanner rate limit exceeded"
        cache.set(rate_key, attempts + 1, 60)
        
        try:
            # Decode and verify JWT
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Check for replay attack
            jti = payload.get('jti')
            if not jti:
                return None, "Invalid token format"
            
            if cache.get(f"token_validated:{jti}"):
                return None, "Token already used"
            
            # Mark token as used
            cache.set(f"token_validated:{jti}", True, cls.TOKEN_VALIDITY_SECONDS * 2)
            
            # Apply grace period for clock skew
            now = datetime.now(dt_timezone.utc)
            exp = datetime.fromtimestamp(payload['exp'], dt_timezone.utc)
            grace_exp = exp + timedelta(seconds=cls.GRACE_PERIOD_SECONDS)
            
            if now > grace_exp:
                return None, "Token expired"
            
            return payload.get('ticket_id'), None
            
        except jwt.ExpiredSignatureError:
            return None, "Token expired"
        except jwt.InvalidTokenError:
            return None, "Invalid token"
        except Exception as e:
            return None, f"Validation error: {str(e)}"
    
    @classmethod
    def generate_device_fingerprint(cls, device_data: Dict[str, str]) -> str:
        """
        Generate a secure hash of device characteristics.
        
        device_data should include:
        - device_id: Unique device identifier
        - app_instance: App instance ID
        - user_id: User ID
        - Additional device characteristics
        """
        # Sort keys for consistent hashing
        fingerprint_data = []
        for key in sorted(device_data.keys()):
            fingerprint_data.append(f"{key}:{device_data[key]}")
        
        fingerprint_string = "|".join(fingerprint_data)
        
        # Generate SHA256 hash with salt
        return hashlib.sha256(
            f"{fingerprint_string}:{settings.SECRET_KEY}".encode()
        ).hexdigest()
    
    @classmethod
    def verify_ticket_integrity(cls, ticket, server_token: str) -> bool:
        """
        Verify that a ticket's server token matches what's stored.
        
        This is the final validation step that ensures the ticket
        hasn't been tampered with.
        """
        return hmac.compare_digest(ticket.server_token, server_token)


class CheckInValidator:
    """
    Validates check-in attempts with comprehensive security checks.
    """
    
    @classmethod
    def validate_check_in(cls, ticket, event, device=None) -> Tuple[bool, str]:
        """
        Perform all validation checks for a check-in attempt.
        
        Returns: (is_valid, error_message)
        """
        # Check if ticket is active
        if ticket.status != 'active':
            return False, "Ticket is not active"
        
        # Check if already checked in
        if ticket.checked_in_at:
            return False, "Already checked in"
        
        # Check if event allows check-in
        if not event.is_check_in_open():
            return False, "Check-in is not open for this event"
        
        # Check user verification (UserProfile is related_name='profile')
        try:
            if not ticket.user.profile.is_verified:
                return False, "User verification required"
        except Exception:
            return False, "User profile not found"
        
        # Check device registration if required
        if event.require_device_registration and device:
            if not ticket.registered_device:
                return False, "Device registration required"
            
            if not event.allow_multiple_devices:
                # Strict device matching
                if ticket.registered_device.id != device.id:
                    return False, "Check-in must be from registered device"
            else:
                # Allow any registered device for this user
                if device.user_id != ticket.user_id:
                    return False, "Device not registered to ticket holder"
        
        # Check attendance limit
        if event.max_attendees:
            current_count = event.get_checked_in_count()
            if current_count >= event.max_attendees:
                return False, "Event is at capacity"
        
        return True, "Valid for check-in"
