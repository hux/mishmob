// Shared TypeScript types for API consistency between web and mobile

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'volunteer' | 'host' | 'admin';
  is_verified: boolean;
  profile_picture?: string;
  zip_code?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type?: 'volunteer' | 'host';
  zip_code?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  email: string;
  user_type: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  location_zip: string;
  commitment: string;
  skills: string[];
  spots_available: number;
  rating: number;
  image?: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  is_remote: boolean;
  featured: boolean;
}

export interface OpportunityDetail extends Opportunity {
  host: OpportunityHost;
  roles: Role[];
  impact_statement: string;
  requirements: string;
  cause_area: string;
}

export interface OpportunityHost {
  id: string;
  organization_name: string;
  website?: string;
  description: string;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
}

export interface Role {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  slots_available: number;
  slots_filled: number;
  time_commitment: string;
  is_leadership: boolean;
  required_skills: Skill[];
  developed_skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'creative' | 'leadership' | 'social' | 'physical';
  description?: string;
}

export interface Application {
  id: string;
  volunteer: User;
  role: Role;
  opportunity: Opportunity;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  availability_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface OpportunityListResponse {
  results: Opportunity[];
  total: number;
  page: number;
  page_size: number;
}