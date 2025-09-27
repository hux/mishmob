#!/usr/bin/env python
"""
Test script to verify AWS Rekognition setup
Run this after adding your AWS credentials to .env
"""

import os
import sys
import django
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mishmob.settings')
django.setup()

from django.conf import settings

def test_aws_credentials():
    """Test if AWS credentials are properly configured"""
    print("Testing AWS Rekognition Configuration...")
    print("-" * 50)
    
    # Check environment variables
    print(f"AWS_ACCESS_KEY_ID: {'✓ Set' if settings.AWS_ACCESS_KEY_ID else '✗ Not set'}")
    print(f"AWS_SECRET_ACCESS_KEY: {'✓ Set' if settings.AWS_SECRET_ACCESS_KEY else '✗ Not set'}")
    print(f"AWS_REGION: {settings.AWS_REGION}")
    print("-" * 50)
    
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        print("❌ AWS credentials are not configured in .env file")
        print("\nPlease add the following to backend/.env:")
        print("AWS_ACCESS_KEY_ID=your_access_key_here")
        print("AWS_SECRET_ACCESS_KEY=your_secret_key_here")
        return False
    
    try:
        # Create Rekognition client
        print("\nTesting connection to AWS Rekognition...")
        rekognition = boto3.client(
            'rekognition',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Test with a simple API call
        # This doesn't cost anything - just lists collections
        response = rekognition.list_collections(MaxResults=1)
        
        print("✅ Successfully connected to AWS Rekognition!")
        print(f"   Region: {settings.AWS_REGION}")
        print(f"   Account has access to Rekognition service")
        
        # Test with sample images if provided
        if len(sys.argv) == 3:
            test_face_comparison(rekognition, sys.argv[1], sys.argv[2])
        else:
            print("\nTo test face comparison, run:")
            print("python test_aws_rekognition.py path/to/id_photo.jpg path/to/selfie.jpg")
        
        return True
        
    except NoCredentialsError:
        print("❌ AWS credentials are invalid or not properly configured")
        return False
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'InvalidUserID.NotFound':
            print("❌ AWS Access Key ID is invalid")
        elif error_code == 'SignatureDoesNotMatch':
            print("❌ AWS Secret Access Key is invalid")
        elif error_code == 'AccessDeniedException':
            print("❌ IAM user does not have Rekognition permissions")
            print("   Please attach AmazonRekognitionFullAccess policy to your IAM user")
        else:
            print(f"❌ AWS Error: {error_code} - {e.response['Error']['Message']}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_face_comparison(rekognition, id_photo_path, selfie_path):
    """Test face comparison with actual images"""
    print("\n" + "=" * 50)
    print("Testing Face Comparison")
    print("=" * 50)
    
    try:
        # Read images
        with open(id_photo_path, 'rb') as f:
            id_photo_bytes = f.read()
        with open(selfie_path, 'rb') as f:
            selfie_bytes = f.read()
        
        print(f"ID Photo: {id_photo_path} ({len(id_photo_bytes):,} bytes)")
        print(f"Selfie: {selfie_path} ({len(selfie_bytes):,} bytes)")
        
        # Compare faces
        print("\nComparing faces...")
        response = rekognition.compare_faces(
            SourceImage={'Bytes': id_photo_bytes},
            TargetImage={'Bytes': selfie_bytes},
            SimilarityThreshold=90.0
        )
        
        if response['FaceMatches']:
            similarity = response['FaceMatches'][0]['Similarity']
            print(f"\n✅ Faces matched!")
            print(f"   Similarity: {similarity:.1f}%")
            print(f"   Would pass 99% threshold: {'Yes' if similarity >= 99 else 'No'}")
            
            # Show face details
            face = response['FaceMatches'][0]['Face']
            print(f"\n   Face details:")
            print(f"   - Confidence: {face['Confidence']:.1f}%")
            print(f"   - Bounding box: {face['BoundingBox']}")
        else:
            print("\n❌ No face matches found above 90% threshold")
            
        # Check source image
        if response['SourceImageFace']:
            print(f"\nSource image face confidence: {response['SourceImageFace']['Confidence']:.1f}%")
        else:
            print("\n⚠️  No face detected in source image")
            
        # Show unmatched faces
        if response.get('UnmatchedFaces'):
            print(f"\n{len(response['UnmatchedFaces'])} unmatched face(s) in target image")
            
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
    except Exception as e:
        print(f"❌ Error comparing faces: {str(e)}")

if __name__ == '__main__':
    print("MishMob AWS Rekognition Test Script")
    print("===================================\n")
    
    success = test_aws_credentials()
    
    if success:
        print("\n✅ AWS Rekognition is properly configured!")
    else:
        print("\n❌ Please fix the configuration issues above")
        sys.exit(1)