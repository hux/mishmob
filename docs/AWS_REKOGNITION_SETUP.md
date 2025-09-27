# AWS Rekognition Setup Guide for MishMob ID Verification

## Overview
This guide will help you set up AWS Rekognition for the ID verification feature in MishMob. The system compares faces between a government ID photo and a selfie to verify user identity with 99%+ confidence.

## Prerequisites
- AWS Account
- AWS CLI installed (optional but recommended)

## Step 1: Create IAM User for Rekognition

### Via AWS Console:

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Navigate to IAM (Identity and Access Management)

2. **Create a new IAM User**
   - Click "Users" → "Add users"
   - User name: `mishmob-rekognition-user`
   - Select "Programmatic access" for Access type

3. **Set Permissions**
   - Choose "Attach existing policies directly"
   - Search for and select: `AmazonRekognitionFullAccess`
   - Alternatively, create a custom policy with minimum required permissions (see below)

4. **Review and Create**
   - Click through to create the user
   - **IMPORTANT**: Save the Access Key ID and Secret Access Key

### Custom IAM Policy (Recommended for Production):
Create a custom policy with only the required permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "MishMobRekognitionAccess",
            "Effect": "Allow",
            "Action": [
                "rekognition:CompareFaces",
                "rekognition:DetectFaces"
            ],
            "Resource": "*"
        }
    ]
}
```

### Via AWS CLI:
```bash
# Create IAM user
aws iam create-user --user-name mishmob-rekognition-user

# Attach Rekognition policy
aws iam attach-user-policy \
    --policy-arn arn:aws:iam::aws:policy/AmazonRekognitionFullAccess \
    --user-name mishmob-rekognition-user

# Create access key
aws iam create-access-key --user-name mishmob-rekognition-user
```

## Step 2: Configure MishMob Backend

1. **Add AWS credentials to your `.env` file:**
   ```bash
   # In backend/.env
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
   AWS_REGION=us-east-1  # or your preferred region
   ```

2. **Restart the backend:**
   ```bash
   make dev-down
   make dev
   # or
   docker-compose restart backend
   ```

## Step 3: Test the Integration

1. **Check backend logs:**
   ```bash
   docker-compose logs -f backend
   ```

2. **Test in the mobile app:**
   - Navigate to Profile → Start Verification
   - Take a photo of an ID with a clear face
   - Take a selfie
   - Check logs for AWS Rekognition API calls

## AWS Rekognition Pricing

- **Free Tier**: 5,000 images per month (first 12 months)
- **After Free Tier**: $0.001 per image (minimum 2 images per verification)
- **Monthly Cost Estimate**:
  - 1,000 verifications = $2.00
  - 10,000 verifications = $20.00

## Security Best Practices

1. **Rotate Access Keys Regularly**
   - Rotate IAM access keys every 90 days
   - Use AWS Secrets Manager for production

2. **Use Environment-Specific Credentials**
   - Different AWS accounts/users for dev, staging, production
   - Never commit credentials to version control

3. **Enable CloudTrail Logging**
   - Monitor all Rekognition API calls
   - Set up alerts for unusual activity

4. **Implement Rate Limiting**
   - Limit verification attempts per user
   - Implement cooldown periods

## Troubleshooting

### Common Issues:

1. **"Invalid security token" error**
   - Check if credentials are correctly set in .env
   - Ensure no extra spaces or quotes
   - Verify the IAM user is active

2. **"Access Denied" error**
   - Check IAM permissions
   - Verify the correct policy is attached
   - Check if the region is correct

3. **"Face not detected" error**
   - Ensure photos have clear, visible faces
   - Check image quality and lighting
   - Verify image size is under 5MB

### Debug Commands:

```bash
# Test AWS credentials
aws rekognition describe-projects --region us-east-1

# Check if credentials are loaded in Django
docker-compose exec backend python manage.py shell
>>> from django.conf import settings
>>> print(settings.AWS_ACCESS_KEY_ID)
>>> print(settings.AWS_REGION)
```

## Additional Features

### Future Enhancements:
1. **Liveness Detection**: Add video-based liveness check
2. **Document Text Extraction**: Use Textract to read ID details
3. **Face Collection**: Store verified faces for faster re-verification
4. **Age Verification**: Estimate age from face analysis

### Compliance Considerations:
- Ensure compliance with privacy laws (GDPR, CCPA)
- Implement data retention policies
- Add user consent for biometric data processing
- Consider encryption for stored images

## Support

For AWS Rekognition documentation:
- https://docs.aws.amazon.com/rekognition/latest/dg/faces.html
- https://docs.aws.amazon.com/rekognition/latest/dg/faces-compare-faces.html

For MishMob-specific issues, check the backend logs and ensure all environment variables are properly set.