# API Endpoints Reference

Complete reference for all MishMob API endpoints.

**Base URL**: `http://localhost:8080/api`
**API Documentation**: `http://localhost:8080/api/docs`
**Authentication**: JWT Bearer Token (except public endpoints)

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "volunteer",  // volunteer|host|admin
  "zip_code": "10001"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "user_type": "volunteer"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully logged out"
}
```

### Social Login
```http
POST /api/auth/social/{provider}
// Providers: google, facebook, apple, linkedin

{
  "access_token": "social-provider-token"
}

Response: 200 OK
{
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

## User Endpoints

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "volunteer",
  "profile": {
    "bio": "Passionate volunteer...",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "skills": [
      {"id": 1, "name": "Python", "proficiency_level": 4},
      {"id": 2, "name": "Teaching", "proficiency_level": 3}
    ]
  }
}
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "bio": "Updated bio...",
  "linkedin_url": "https://linkedin.com/in/johnsmith"
}

Response: 200 OK
```

### Upload Resume
```http
POST /api/users/me/upload-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: resume.pdf

Response: 200 OK
{
  "message": "Resume uploaded successfully",
  "parsed_skills": ["Python", "JavaScript", "Project Management"]
}
```

### Get User by ID
```http
GET /api/users/{user_id}

Response: 200 OK
{
  "id": 1,
  "username": "johndoe",
  "user_type": "volunteer",
  "profile": {
    "bio": "Public bio...",
    "skills": [...]
  }
}
```

## Skills Endpoints

### List All Skills
```http
GET /api/skills?category=technical

Response: 200 OK
[
  {
    "id": 1,
    "name": "Python",
    "category": "technical"
  },
  {
    "id": 2,
    "name": "JavaScript",
    "category": "technical"
  }
]
```

### Search Skills
```http
GET /api/skills/search?q=python

Response: 200 OK
[
  {
    "id": 1,
    "name": "Python",
    "category": "technical",
    "users_count": 150
  }
]
```

### Add Skill to Profile
```http
POST /api/users/me/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "skill_id": 1,
  "proficiency_level": 4  // 1-5
}

Response: 201 Created
```

### Remove Skill from Profile
```http
DELETE /api/users/me/skills/{skill_id}
Authorization: Bearer <token>

Response: 204 No Content
```

## Opportunities Endpoints

### List Opportunities
```http
GET /api/opportunities?zip_code=10001&skills=1,2,3&page=1&limit=20

Response: 200 OK
{
  "results": [
    {
      "id": 1,
      "title": "Youth Mentoring Program",
      "description": "Help mentor local youth...",
      "host": {
        "id": 1,
        "organization_name": "Youth Center"
      },
      "start_date": "2024-11-01T10:00:00Z",
      "end_date": "2024-11-01T14:00:00Z",
      "location_zip": "10001",
      "status": "active",
      "roles": [
        {
          "id": 1,
          "title": "Mentor",
          "slots_available": 5,
          "required_skills": ["Teaching", "Communication"]
        }
      ],
      "match_percentage": 85
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

### Get Opportunity Details
```http
GET /api/opportunities/{opportunity_id}

Response: 200 OK
{
  "id": 1,
  "title": "Youth Mentoring Program",
  "description": "Full description...",
  "host": {
    "id": 1,
    "organization_name": "Youth Center",
    "website": "https://youthcenter.org",
    "is_verified": true
  },
  "start_date": "2024-11-01T10:00:00Z",
  "end_date": "2024-11-01T14:00:00Z",
  "location": {
    "zip_code": "10001",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY"
  },
  "impact_statement": "Help shape young minds...",
  "requirements": [
    "Background check required",
    "Must be 18+"
  ],
  "roles": [...],
  "applications_count": 12,
  "is_applied": false  // For authenticated users
}
```

### Create Opportunity (Hosts Only)
```http
POST /api/opportunities
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Community Garden Project",
  "description": "Help maintain our community garden...",
  "start_date": "2024-11-15T09:00:00Z",
  "end_date": "2024-11-15T12:00:00Z",
  "location_zip": "10002",
  "address": "456 Park Ave",
  "impact_statement": "Beautify the neighborhood...",
  "roles": [
    {
      "title": "Gardener",
      "description": "Plant and maintain garden",
      "slots_available": 10,
      "required_skills": [1, 5],  // Skill IDs
      "skills_developed": [1, 5, 8]
    }
  ]
}

Response: 201 Created
```

### Update Opportunity
```http
PUT /api/opportunities/{opportunity_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description..."
}

Response: 200 OK
```

### Delete Opportunity
```http
DELETE /api/opportunities/{opportunity_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### Apply to Opportunity
```http
POST /api/opportunities/{opportunity_id}/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "role_id": 1,
  "cover_letter": "I'm interested in this opportunity because..."
}

Response: 201 Created
{
  "application_id": 123,
  "status": "pending"
}
```

### Get My Applications
```http
GET /api/users/me/applications

Response: 200 OK
[
  {
    "id": 123,
    "opportunity": {
      "id": 1,
      "title": "Youth Mentoring Program"
    },
    "role": {
      "id": 1,
      "title": "Mentor"
    },
    "status": "pending",  // pending|accepted|rejected|withdrawn
    "submitted_at": "2024-10-15T10:30:00Z"
  }
]
```

### Withdraw Application
```http
DELETE /api/applications/{application_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### Get Opportunity Applications (Host Only)
```http
GET /api/opportunities/{opportunity_id}/applications
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 123,
    "volunteer": {
      "id": 5,
      "username": "volunteer1",
      "profile": {...}
    },
    "role": {
      "id": 1,
      "title": "Mentor"
    },
    "status": "pending",
    "cover_letter": "...",
    "submitted_at": "2024-10-15T10:30:00Z"
  }
]
```

### Update Application Status (Host Only)
```http
PUT /api/applications/{application_id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted",  // accepted|rejected
  "message": "Welcome to our team!"  // Optional
}

Response: 200 OK
```

## Events Endpoints

### List Events
```http
GET /api/events?zip_code=10001&event_type=social

Response: 200 OK
[
  {
    "id": 1,
    "title": "Community Potluck",
    "description": "Monthly community gathering...",
    "event_date": "2024-11-20T18:00:00Z",
    "location": {
      "address": "Community Center",
      "zip_code": "10001"
    },
    "event_type": "social",
    "max_attendees": 50,
    "attendees_count": 23,
    "is_registered": false
  }
]
```

### Get Event Details
```http
GET /api/events/{event_id}

Response: 200 OK
{
  "id": 1,
  "title": "Community Potluck",
  "description": "Full event description...",
  "host": {...},
  "event_date": "2024-11-20T18:00:00Z",
  "location": {...},
  "max_attendees": 50,
  "attendees_count": 23,
  "is_registered": false,
  "ticket": null  // Or ticket object if registered
}
```

### Register for Event
```http
POST /api/events/{event_id}/register
Authorization: Bearer <token>

Response: 201 Created
{
  "ticket_id": "TKT-123456",
  "qr_code": "data:image/png;base64,..."
}
```

### Get Event Ticket
```http
GET /api/events/{event_id}/ticket
Authorization: Bearer <token>

Response: 200 OK
{
  "ticket_id": "TKT-123456",
  "event": {...},
  "qr_code": "data:image/png;base64,..."
  "checked_in": false
}
```

### Check In to Event (QR Code)
```http
POST /api/events/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticket_code": "TKT-123456"
}

Response: 200 OK
{
  "message": "Successfully checked in",
  "check_in_time": "2024-11-20T18:05:00Z"
}
```

## Learning Management (LMS) Endpoints

### List Courses
```http
GET /api/lms/courses?audience_type=volunteer

Response: 200 OK
[
  {
    "id": 1,
    "title": "Volunteer Orientation",
    "description": "Introduction to volunteering...",
    "audience_type": "volunteer",
    "is_required": true,
    "estimated_hours": 2.5,
    "modules_count": 5,
    "enrolled": false
  }
]
```

### Get Course Details
```http
GET /api/lms/courses/{course_id}

Response: 200 OK
{
  "id": 1,
  "title": "Volunteer Orientation",
  "description": "Full course description...",
  "modules": [
    {
      "id": 1,
      "title": "Welcome to MishMob",
      "order": 1,
      "estimated_minutes": 15,
      "completed": false
    }
  ],
  "enrollment": {
    "enrolled_at": "2024-10-01T10:00:00Z",
    "progress_percentage": 40,
    "completed": false
  }
}
```

### Enroll in Course
```http
POST /api/lms/courses/{course_id}/enroll
Authorization: Bearer <token>

Response: 201 Created
{
  "enrollment_id": 123,
  "message": "Successfully enrolled"
}
```

### Get Module Content
```http
GET /api/lms/modules/{module_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "title": "Welcome to MishMob",
  "content": "<h1>Welcome...</h1><p>Content HTML...</p>",
  "video_url": "https://youtube.com/...",
  "resources": [
    {
      "title": "Volunteer Handbook",
      "url": "https://..."
    }
  ],
  "quiz": null  // Or quiz object if exists
}
```

### Complete Module
```http
POST /api/lms/modules/{module_id}/complete
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Module completed",
  "course_progress": 60  // Percentage
}
```

### Get My Enrollments
```http
GET /api/lms/my-courses
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "course": {...},
    "enrolled_at": "2024-10-01T10:00:00Z",
    "progress_percentage": 60,
    "last_accessed": "2024-10-15T14:30:00Z"
  }
]
```

## Messaging Endpoints

### List Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "participants": [
      {"id": 1, "username": "johndoe"},
      {"id": 2, "username": "janedoe"}
    ],
    "last_message": {
      "content": "Thanks for applying!",
      "sent_at": "2024-10-15T15:30:00Z",
      "sender_id": 2
    },
    "unread_count": 2
  }
]
```

### Get Conversation Messages
```http
GET /api/messages/conversations/{conversation_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "conversation": {...},
  "messages": [
    {
      "id": 1,
      "sender": {"id": 1, "username": "johndoe"},
      "content": "Hi, I'm interested in the opportunity",
      "sent_at": "2024-10-15T15:00:00Z",
      "is_read": true
    }
  ]
}
```

### Send Message
```http
POST /api/messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": 2,  // Or conversation_id
  "content": "Hello, I have a question..."
}

Response: 201 Created
{
  "message_id": 123,
  "conversation_id": 1
}
```

### Mark Messages as Read
```http
PUT /api/messages/conversations/{conversation_id}/read
Authorization: Bearer <token>

Response: 200 OK
```

## Notifications Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "type": "application_accepted",
    "title": "Application Accepted",
    "message": "Your application for Youth Mentoring has been accepted",
    "created_at": "2024-10-15T16:00:00Z",
    "is_read": false,
    "data": {
      "opportunity_id": 1,
      "application_id": 123
    }
  }
]
```

### Mark Notification as Read
```http
PUT /api/notifications/{notification_id}/read
Authorization: Bearer <token>

Response: 200 OK
```

### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>

Response: 200 OK
```

## Search Endpoints

### Global Search
```http
GET /api/search?q=gardening&type=all

Response: 200 OK
{
  "opportunities": [...],
  "events": [...],
  "organizations": [...],
  "courses": [...]
}
```

### Opportunity Search
```http
GET /api/search/opportunities?q=mentor&location=10001&skills=teaching

Response: 200 OK
[
  {
    "id": 1,
    "title": "Youth Mentoring Program",
    "description": "...",
    "match_score": 0.95,
    "highlights": {
      "title": "Youth <mark>Mentoring</mark> Program"
    }
  }
]
```

## Verification Endpoints

### Request Background Check
```http
POST /api/verification/background-check
Authorization: Bearer <token>
Content-Type: application/json

{
  "consent": true,
  "ssn_last_four": "1234"
}

Response: 202 Accepted
{
  "request_id": "BGC-123456",
  "status": "pending",
  "estimated_completion": "2024-10-20T10:00:00Z"
}
```

### Check Verification Status
```http
GET /api/verification/status
Authorization: Bearer <token>

Response: 200 OK
{
  "background_check": {
    "status": "completed",  // pending|completed|failed
    "completed_at": "2024-10-20T09:30:00Z",
    "expires_at": "2025-10-20T09:30:00Z"
  },
  "id_verification": {
    "status": "not_started"
  }
}
```

## Statistics Endpoints

### Get User Statistics
```http
GET /api/stats/user
Authorization: Bearer <token>

Response: 200 OK
{
  "volunteer_hours": 125.5,
  "opportunities_completed": 12,
  "skills_developed": 8,
  "impact_score": 850,
  "badges": [
    {
      "name": "Super Volunteer",
      "earned_at": "2024-09-15T10:00:00Z"
    }
  ]
}
```

### Get Opportunity Statistics (Host)
```http
GET /api/stats/opportunity/{opportunity_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "views": 250,
  "applications": 45,
  "accepted": 10,
  "completion_rate": 0.8,
  "volunteer_hours": 120,
  "satisfaction_score": 4.5
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "email": ["This field is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Permission denied",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "The requested resource was not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints have the following rate limits:

- **Authentication**: 5 requests per hour per IP
- **General API**: 100 requests per minute per user
- **Search**: 30 requests per minute per user
- **File uploads**: 10 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697381400
```

---

Last updated: October 2024