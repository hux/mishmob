# MishMob - AI Assistant Context Guide

## IMPORTANT: Port Configuration
- **Backend API**: http://localhost:8080 (NOT 8000 - another project uses that port)
- **Frontend Dev Server**: http://localhost:8081 (Vite auto-selects available port)
- Always run Django backend on port 8080: `python manage.py runserver 8080`

## Vision Statement
MishMob (Mission Mobilization) envisions a world where purpose, meaning, and belonging are accessible to everyone through action. By enabling individuals to quickly and effectively mobilize around local missions, MishMob unlocks human potential for both individual purpose and community service. Our platform identifies unique skillsets, connects people with compelling opportunities, and inspires them to serve. Through thoughtful, intentional micro-missions, we address community needs, foster connection, and build stronger, more resilient communities—one mission at a time.

## Project Overview
MishMob is a community volunteer matching platform that connects skilled volunteers with meaningful opportunities using AI-powered matching. The platform is designed to connect volunteers with opportunities hosted by various organizations, fostering community engagement and skill development.

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (component library based on Radix UI)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **API**: Django + Django Ninja (OpenAPI/FastAPI-style) + Pydantic
- **Database**: PostgreSQL with PostGIS extension for geolocation
- **Authentication**: Django Allauth (social logins) + JWT for API authentication
- **Storage**: AWS S3 or Google Cloud Storage for media files
- **Deployment**: Docker on AWS/GCP/Azure

### Third-Party Services
- **Resume/LinkedIn Parsing**: Sovren or HireAbility
- **Background Checks**: Checkr or similar
- **Communications**: Twilio SendGrid for Email/SMS
- **Maps**: Google Maps API/OpenStreetMap

### Infrastructure
- **Hosting**: AWS EC2 with Docker Compose
- **Database**: Aurora Serverless v2 (scales 0.5-4 ACUs)
- **CDN**: CloudFront (optional)
- **SSL**: Let's Encrypt or AWS Certificate Manager
- **CI/CD**: GitHub Actions

## Project Structure

### Monorepo Structure (Planned)
```
mishmob/
├── backend/              # Django Project
│   ├── mishmob/         # Django Core App
│   ├── api/             # Django Ninja API App
│   ├── users/           # User management, profiles, skills
│   ├── opportunities/   # Opportunities, projects, roles
│   ├── lms/             # Learning Management System
│   └── manage.py
├── frontend/            # React Web App (Current)
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/
│   │   │   └── ui/      # shadcn/ui components
│   │   ├── features/    # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── opportunities/
│   │   │   ├── profile/
│   │   │   ├── project-management/
│   │   │   └── lms/
│   │   ├── pages/
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   └── App.tsx      # Main app component
│   └── public/
└── mobile/              # React Native App (Future)
    ├── src/
    └── package.json
```

### Current Structure
```
mishmob/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx     # Landing page
│   │   └── NotFound.tsx  # 404 page
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── assets/           # Images and static assets
│   └── App.tsx           # Main app component with routing
├── backend-scaffold/     # Backend setup instructions
├── deployment/          # Production deployment configs
└── public/             # Static assets
```

## Key Features

### For Volunteers
- AI-powered skills matching from resume/LinkedIn
- Location-based opportunity search
- Impact tracking dashboard
- Skill development and verification
- Community ratings and endorsements

### For Organizations
- Opportunity posting and management
- Volunteer team building
- Impact analytics
- Built-in volunteer training paths

## Design System

### Brand Colors
- **Primary**: Purpose-driven blue (`hsl(214 84% 56%)`)
- **Secondary**: Community orange (`hsl(25 95% 53%)`)
- **Accent**: Growth green (`hsl(142 76% 36%)`)

### UI Patterns
- Gradient overlays for hero sections
- Card-based layouts with hover effects
- Smooth transitions and animations
- Mobile-first responsive design

## Development Guidelines

### Component Architecture
- All UI components are in `/src/components/ui/`
- Custom components extend shadcn/ui base components
- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)

### Styling Approach
- Tailwind CSS for utility-first styling
- Custom CSS variables in `index.css` for theming
- Component-specific styles use Tailwind classes
- Dark mode support built-in

### State Management
- TanStack Query for server state (API calls)
- Local state with React hooks
- Form state with React Hook Form
- No global state management library currently

### Routing
- React Router v6 for client-side routing
- Routes defined in `App.tsx`
- Lazy loading for route components (future enhancement)

## Current Implementation Status

### Completed
- ✅ Landing page with hero, features, and CTAs
- ✅ shadcn/ui component library integration
- ✅ Responsive navigation component
- ✅ Opportunity card component
- ✅ Custom design system and theming
- ✅ Basic routing setup

### In Progress
- 🚧 Backend API development
- 🚧 User authentication flow
- 🚧 Opportunity listing page
- 🚧 User dashboard

### Planned
- 📋 AI skills matching integration
- 📋 Real-time notifications
- 📋 Impact tracking visualizations
- 📋 Organization management portal

## Important Notes

### Environment Variables
- Frontend currently has no env vars
- Backend will require AWS credentials, database connection strings
- Use `.env` files for local development

### API Integration
- API endpoints will follow RESTful conventions
- Frontend prepared for TanStack Query integration
- CORS will be configured for local development

### Deployment
- Frontend builds to static files (Vite)
- Backend uses Docker for containerization
- Nginx serves frontend and proxies API requests
- GitHub Actions automates deployment

## Common Tasks

### Adding a New Page
1. Create component in `/src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed

### Creating a New UI Component
1. Use shadcn/ui CLI or copy from docs
2. Customize with project theme colors
3. Add to `/src/components/ui/`

### Modifying Theme
1. Edit CSS variables in `/src/index.css`
2. Update Tailwind config if needed
3. Test both light and dark modes

## Development Commands
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Key Files to Understand
- `/src/App.tsx` - Main app setup and routing
- `/src/pages/Index.tsx` - Landing page implementation
- `/src/index.css` - Theme and design system
- `/tailwind.config.ts` - Tailwind customization
- `/src/components/ui/` - Reusable UI components

## Architecture Decisions
- **Vite over CRA**: Faster build times and better DX
- **shadcn/ui over MUI**: More customizable, smaller bundle
- **TanStack Query**: Powerful data fetching with caching
- **Django Ninja**: FastAPI-like experience with Django ORM
- **PostgreSQL with PostGIS**: Powerful geospatial queries for location-based matching
- **Microservices approach**: Separate backend API and frontend for scalability

## Backend Data Models

### Users App Models
- **User** (extends AbstractUser): user_type (Volunteer/Host/Admin), profile_picture, zip_code, is_verified
- **UserProfile**: bio, linkedin_url, resume, parsed_skills_json
- **Skill**: name, category (Technical/Creative/Leadership)
- **UserSkill**: M2M through table with proficiency_level, is_verified

### Opportunities App Models
- **OpportunityHost**: organization_name, website, description, is_verified
- **Opportunity**: title, description (rich text), dates, status, location_zip, impact_statement
- **Role**: title, description, slots_available
- **RoleSkill**: M2M through table for required skills and skills_developed
- **Application**: volunteer, role, status, submitted_at

### LMS App Models
- **Course**: title, description, audience_type (Volunteer/Host)
- **Module**: title, content, order
- **Enrollment**: user, course, completion_status

## API Endpoints Structure

### Authentication (/api/auth/)
- POST /register - Create new user
- POST /login - Obtain JWT token
- GET /user - Get current user details

### Users & Profiles (/api/users/)
- GET /{user_id} - Get public user profile
- PUT /me - Update authenticated user profile
- POST /me/upload-resume - Upload resume and trigger parsing
- GET /skills - Search for skills

### Opportunities (/api/opportunities/)
- GET / - List/search opportunities (by zip, skills)
- GET /{opp_id} - Get opportunity details
- POST / - Create new opportunity (hosts only)
- POST /{opp_id}/apply - Apply for a role

### Project Management (/api/projects/)
- GET /{opp_id}/dashboard - Get project status, volunteers, milestones
- POST /{opp_id}/milestones - Create milestone
- GET /{opp_id}/forum - Get forum posts
- POST /{opp_id}/forum - Create forum post

### LMS (/api/lms/)
- GET /courses - List available courses
- POST /courses/{course_id}/enroll - Enroll in course
- GET /my-courses - List user's enrolled courses

## Key Features Deep Dive

### Skills Assessment & Matching
1. **Skill Extraction**: Resume/LinkedIn parsing via third-party service
2. **Self-Assessment**: User confirms and rates proficiency levels
3. **Matching Algorithm**: 
   - Queries Opportunity → Role → RoleSkill against UserSkill
   - Weights exact matches, proficiency levels, location
   - Returns ranked recommendations

### Learning Management System
1. **Host Training**: Required courses before publishing opportunities
2. **Volunteer Onboarding**: General and opportunity-specific courses
3. **Verification**: Track completion for quality assurance

### Project Management & Metrics
1. **Phases**: Track opportunity lifecycle stages
2. **Dashboards**: Visualize volunteer hours, milestones, engagement
3. **Knowledge Library**: Store successful project templates

## Community & Engagement Features

### Digital Community
- **Forums**: Rich text posts linked to each opportunity
- **Impact Pages**: Public showcase of completed projects
- **Homepage Feed**: Recent impact stories for inspiration

### In-Person Events
- **CommunityEvent Model**: Separate from opportunities
- **Event Types**: Storytelling nights, skills shares, potlucks
- **RSVP System**: Similar to opportunity applications

### User Engagement Loop
1. **Discover**: Find matching opportunities
2. **Engage**: Apply and complete training
3. **Contribute**: Participate in projects
4. **Connect**: Build relationships
5. **Reflect**: Share stories and impact
6. **Grow**: Develop new skills
7. **Return**: Find next mission

## Mobile App Features (React Native)
- **Event Check-in/out**: QR codes or geolocation
- **Push Notifications**: Application updates, alerts
- **On-the-Go Communication**: Mobile-friendly forum/chat
- **Profile Management**: Update profile anywhere

### Mobile Tech Stack
- **Expo**: Streamlined development
- **React Navigation**: Routing
- **React Native Paper**: Material Design UI
- **React Query**: Shared with web app
- **Expo Camera**: QR scanning
- **Expo Notifications**: Push notifications