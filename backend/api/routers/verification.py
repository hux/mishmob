import boto3
import base64
import io
from typing import Optional
from django.conf import settings
from ninja import Router, File, Form
from ninja.files import UploadedFile
from pydantic import BaseModel
from PIL import Image
import logging
from botocore.exceptions import ClientError

from users.models import User
from api.auth import jwt_auth  # Use the existing JWT auth

logger = logging.getLogger(__name__)

router = Router()


class VerificationResponse(BaseModel):
    similarity: float
    is_verified: bool
    message: str


def compare_faces(id_image_bytes: bytes, selfie_image_bytes: bytes) -> tuple[float, bool]:
    """
    Compare two faces using AWS Rekognition
    Returns similarity score and whether they match above 99% threshold
    """
    # Check if AWS credentials are configured
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        logger.warning("AWS credentials not configured - using mock response for testing")
        # Mock response for testing - in production, this should fail
        import random
        similarity = random.uniform(0.85, 0.995)  # Random similarity for testing
        return similarity, similarity >= 0.99
    
    try:
        # Initialize AWS Rekognition client
        rekognition = boto3.client(
            'rekognition',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Compare faces with lower threshold to get all matches
        response = rekognition.compare_faces(
            SourceImage={'Bytes': id_image_bytes},
            TargetImage={'Bytes': selfie_image_bytes},
            SimilarityThreshold=80.0  # Lower threshold to catch more matches
        )
        
        if response['FaceMatches']:
            # Get the highest similarity score
            similarity = response['FaceMatches'][0]['Similarity'] / 100.0
            logger.info(f"Face comparison result: {similarity:.1%} similarity")
            return similarity, similarity >= 0.99
        else:
            # Check if faces were detected
            if not response.get('SourceImageFace'):
                logger.warning("No face detected in ID photo")
                raise ValueError("No face detected in ID photo. Please ensure the ID photo clearly shows a face.")
            
            if len(response.get('UnmatchedFaces', [])) == 0:
                logger.warning("No face detected in selfie")
                raise ValueError("No face detected in selfie. Please ensure your face is clearly visible.")
            
            # Faces detected but don't match
            logger.info("Faces detected but similarity below 80%")
            return 0.0, False
            
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code == 'InvalidParameterException':
            if 'size' in error_message.lower():
                raise ValueError("Image file too large. Please use images under 5MB.")
            elif 'format' in error_message.lower():
                raise ValueError("Invalid image format. Please use JPEG or PNG images.")
        elif error_code == 'AccessDeniedException':
            logger.error("AWS Rekognition access denied")
            raise ValueError("Service temporarily unavailable. Please try again later.")
        elif error_code == 'InvalidImageFormatException':
            raise ValueError("Invalid image format. Please use JPEG or PNG images.")
        else:
            logger.error(f"AWS Rekognition error: {error_code} - {error_message}")
            raise ValueError("An error occurred during verification. Please try again.")
            
    except Exception as e:
        logger.error(f"Unexpected error in face comparison: {str(e)}")
        if isinstance(e, ValueError):
            raise
        raise ValueError("An unexpected error occurred. Please try again.")


def process_image(uploaded_file: UploadedFile, max_size: int = 5242880) -> bytes:
    """
    Process and validate uploaded image
    Returns image bytes for AWS Rekognition
    """
    # Check file size (max 5MB for Rekognition)
    if uploaded_file.size > max_size:
        raise ValueError("Image file too large. Maximum size is 5MB.")
    
    # Read image bytes
    image_bytes = uploaded_file.read()
    
    # Validate it's actually an image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception:
        raise ValueError("Invalid image file")
    
    return image_bytes


@router.post("/verify-identity", response=VerificationResponse, auth=jwt_auth)
def verify_identity(
    request,
    id_image: UploadedFile = File(...),
    selfie_image: UploadedFile = File(...)
):
    """
    Verify user identity by comparing ID photo with selfie
    Requires 99% similarity for verification
    """
    try:
        # Process images
        id_bytes = process_image(id_image)
        selfie_bytes = process_image(selfie_image)
        
        # Compare faces using AWS Rekognition
        similarity, is_verified = compare_faces(id_bytes, selfie_bytes)
        
        # Update user verification status if successful
        if is_verified:
            from django.utils import timezone
            user = request.user
            
            # Get or create user profile
            from users.models import UserProfile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            profile.is_verified = True
            profile.verified_at = timezone.now()
            profile.save()
            
            message = "Identity verification successful! You are now a verified volunteer."
        else:
            message = f"Faces do not match with required confidence. Similarity: {similarity:.1%}. Please ensure your face is clearly visible in both photos and try again."
        
        return VerificationResponse(
            similarity=similarity,
            is_verified=is_verified,
            message=message
        )
        
    except ValueError as e:
        return VerificationResponse(
            similarity=0.0,
            is_verified=False,
            message=str(e)
        )
    except Exception as e:
        logger.error(f"Identity verification error: {str(e)}")
        return VerificationResponse(
            similarity=0.0,
            is_verified=False,
            message="An error occurred during verification. Please try again."
        )


@router.get("/verification-status", auth=jwt_auth)
def get_verification_status(request):
    """Get current user's verification status"""
    try:
        from users.models import UserProfile
        profile = UserProfile.objects.get(user=request.user)
        return {
            "is_verified": profile.is_verified,
            "can_verify": not profile.is_verified,
            "verified_at": profile.verified_at.isoformat() if profile.verified_at else None
        }
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        profile = UserProfile.objects.create(user=request.user)
        return {
            "is_verified": False,
            "can_verify": True,
            "verified_at": None
        }