#!/usr/bin/env python
"""Test QR code generation and token validation"""

import os
import sys
import django
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from events.models import EventTicket
from events.utils import SecureTokenGenerator
from django.contrib.auth import get_user_model

User = get_user_model()

def test_qr_generation():
    """Test QR code generation for a user's ticket"""
    
    # Get volunteer1's first ticket
    user = User.objects.get(username='volunteer1')
    ticket = EventTicket.objects.filter(user=user).first()
    
    if not ticket:
        print("No ticket found for volunteer1!")
        return
    
    print(f"Testing QR generation for: {ticket.event.opportunity.title}")
    print(f"Ticket ID: {ticket.id}")
    print(f"User: {user.get_full_name()} ({user.username})")
    print(f"Server Token: {ticket.server_token[:20]}... (truncated for security)")
    
    # Generate QR token
    print("\n1. Generating QR token...")
    try:
        token_data = SecureTokenGenerator.generate_qr_token(
            ticket_id=str(ticket.id),
            user_id=user.id
        )
        
        print(f"✓ Token generated successfully!")
        print(f"  Token length: {len(token_data['token'])} characters")
        print(f"  Expires at: {token_data['expires_at']}")
        print(f"  Valid for: {token_data['valid_seconds']} seconds")
        
        # Show first 50 chars of token
        print(f"  Token preview: {token_data['token'][:50]}...")
        
        # Test token validation
        print("\n2. Validating token...")
        ticket_id_result, error = SecureTokenGenerator.validate_qr_token(
            token_data['token'],
            scanner_id=1  # Mock scanner ID
        )
        
        if error:
            print(f"✗ Validation failed: {error}")
        else:
            print(f"✓ Token validated successfully!")
            print(f"  Retrieved ticket ID: {ticket_id_result}")
            print(f"  Matches original: {ticket_id_result == str(ticket.id)}")
        
        # Test expired token
        print("\n3. Testing expired token (waiting 2 seconds)...")
        time.sleep(2)
        
        # Try to use the same token again (should fail due to replay protection)
        ticket_id_result2, error2 = SecureTokenGenerator.validate_qr_token(
            token_data['token'],
            scanner_id=1
        )
        
        if error2:
            print(f"✓ Token correctly rejected: {error2}")
        else:
            print(f"✗ ERROR: Token should have been rejected!")
        
        # Generate new token to test rotation
        print("\n4. Generating new token (rotation test)...")
        token_data2 = SecureTokenGenerator.generate_qr_token(
            ticket_id=str(ticket.id),
            user_id=user.id
        )
        
        print(f"✓ New token generated!")
        print(f"  Tokens are different: {token_data['token'] != token_data2['token']}")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")


if __name__ == '__main__':
    print("=" * 60)
    print("QR Code Generation Test")
    print("=" * 60)
    test_qr_generation()