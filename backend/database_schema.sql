-- MishMob Database Schema
-- PostgreSQL with PostGIS extension

-- Enable PostGIS for geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users and Authentication
CREATE TABLE auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    is_staff BOOLEAN DEFAULT false,
    is_superuser BOOLEAN DEFAULT false,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    user_type VARCHAR(20) CHECK (user_type IN ('volunteer', 'host', 'admin')) DEFAULT 'volunteer',
    profile_picture VARCHAR(200),
    zip_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profile (extended information)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    bio TEXT,
    linkedin_url VARCHAR(200),
    resume_file VARCHAR(200),
    parsed_skills_json JSONB,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    background_check_status VARCHAR(20) DEFAULT 'pending',
    background_check_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills catalog
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('technical', 'creative', 'leadership', 'social', 'physical')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Skills (many-to-many with proficiency)
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER,
    is_verified BOOLEAN DEFAULT false,
    verified_by_id INTEGER REFERENCES auth_user(id),
    verified_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- Opportunity Hosts (Organizations)
CREATE TABLE opportunity_hosts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    organization_type VARCHAR(50),
    tax_id VARCHAR(50),
    website VARCHAR(200),
    description TEXT,
    logo VARCHAR(200),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for geolocation
    is_verified BOOLEAN DEFAULT false,
    verified_date DATE,
    rating_average DECIMAL(2, 1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities (Projects/Missions)
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL REFERENCES opportunity_hosts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT NOT NULL,
    cause_area VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    recurring_schedule JSONB, -- For recurring opportunities
    status VARCHAR(20) CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
    location_name VARCHAR(200),
    location_address VARCHAR(300),
    location_zip VARCHAR(10),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    is_remote BOOLEAN DEFAULT false,
    impact_statement TEXT,
    requirements TEXT,
    time_commitment VARCHAR(100),
    current_phase VARCHAR(50),
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Roles within Opportunities
CREATE TABLE opportunity_roles (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    responsibilities TEXT,
    slots_available INTEGER NOT NULL DEFAULT 1,
    slots_filled INTEGER DEFAULT 0,
    time_commitment VARCHAR(100),
    is_leadership BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Skills (required and developed)
CREATE TABLE role_skills (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES opportunity_roles(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id),
    skill_type VARCHAR(20) CHECK (skill_type IN ('required', 'developed', 'preferred')),
    importance_level VARCHAR(20) CHECK (importance_level IN ('must_have', 'nice_to_have', 'optional')),
    UNIQUE(role_id, skill_id, skill_type)
);

-- Applications
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES opportunity_roles(id) ON DELETE CASCADE,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
    cover_letter TEXT,
    availability_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id INTEGER REFERENCES auth_user(id),
    rejection_reason TEXT,
    UNIQUE(volunteer_id, role_id)
);

-- Project Participation (accepted volunteers)
CREATE TABLE project_participants (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    volunteer_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES opportunity_roles(id),
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'withdrawn')) DEFAULT 'active',
    hours_logged DECIMAL(6, 2) DEFAULT 0,
    impact_statement TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    UNIQUE(opportunity_id, volunteer_id)
);

-- Time Tracking
CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL REFERENCES project_participants(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_location GEOGRAPHY(POINT, 4326),
    check_out_location GEOGRAPHY(POINT, 4326),
    check_in_method VARCHAR(20) CHECK (check_in_method IN ('qr_code', 'geolocation', 'manual')),
    hours DECIMAL(4, 2),
    notes TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Milestones
CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    created_by_id INTEGER NOT NULL REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forums/Communication
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    parent_post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_announcement BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LMS Courses
CREATE TABLE lms_courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT,
    audience_type VARCHAR(20) CHECK (audience_type IN ('volunteer', 'host', 'both')) DEFAULT 'both',
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- in minutes
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by_id INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LMS Modules
CREATE TABLE lms_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    content_type VARCHAR(20) CHECK (content_type IN ('text', 'video', 'quiz', 'assignment')),
    video_url VARCHAR(300),
    display_order INTEGER NOT NULL,
    duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LMS Enrollments
CREATE TABLE lms_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP WITH TIME ZONE,
    completion_status VARCHAR(20) CHECK (completion_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT false,
    UNIQUE(user_id, course_id)
);

-- Module Progress
CREATE TABLE lms_module_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES lms_enrollments(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES lms_modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    quiz_score DECIMAL(5, 2),
    UNIQUE(enrollment_id, module_id)
);

-- Community Events
CREATE TABLE community_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- in minutes
    location_name VARCHAR(200),
    location_address VARCHAR(300),
    location GEOGRAPHY(POINT, 4326),
    is_online BOOLEAN DEFAULT false,
    online_link VARCHAR(300),
    organizer_id INTEGER NOT NULL REFERENCES auth_user(id),
    max_attendees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event RSVPs
CREATE TABLE event_rsvps (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('attending', 'maybe', 'not_attending')) DEFAULT 'attending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Platform Statistics (for homepage)
CREATE TABLE platform_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL,
    total_volunteers INTEGER DEFAULT 0,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    total_opportunities INTEGER DEFAULT 0,
    total_lives_impacted INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_opportunities_location ON opportunities USING GIST (location);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_zip ON opportunities(location_zip);
CREATE INDEX idx_opportunities_dates ON opportunities(start_date, end_date);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_applications_volunteer ON applications(volunteer_id);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_forum_posts_opportunity ON forum_posts(opportunity_id);
CREATE INDEX idx_time_entries_participant ON time_entries(participant_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auth_user_updated_at BEFORE UPDATE ON auth_user FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunity_hosts_updated_at BEFORE UPDATE ON opportunity_hosts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lms_courses_updated_at BEFORE UPDATE ON lms_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();