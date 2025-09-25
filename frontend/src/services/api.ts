// API configuration and base client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Type definitions
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
  status: string;
  is_remote: boolean;
  featured: boolean;
}

export interface OpportunityDetail extends Opportunity {
  organization_id: number;
  location_name: string;
  location_address: string;
  cause_area: string;
  time_commitment: string;
  impact_statement: string;
  requirements: string;
  view_count: number;
  roles: Role[];
  host_info: {
    id: number;
    name: string;
    website: string;
    description: string;
    is_verified: boolean;
    rating_average: number;
    rating_count: number;
  };
}

export interface Role {
  id: number;
  title: string;
  description: string;
  responsibilities: string;
  slots_available: number;
  slots_filled: number;
  time_commitment: string;
  is_leadership: boolean;
  required_skills: SkillInfo[];
  developed_skills: SkillInfo[];
}

export interface SkillInfo {
  name: string;
  category: string;
}

export interface ApplicationResponse {
  message: string;
  application_id: string;
}

export interface OpportunityListResponse {
  results: Opportunity[];
  total: number;
  page: number;
  page_size: number;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
const TOKEN_KEY = 'mishmob_auth_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

// Base fetch function with auth headers
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = tokenManager.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    tokenManager.setToken(response.access_token);
    return response;
  },

  async register(data: RegisterData): Promise<User> {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
    tokenManager.removeToken();
  },

  async getCurrentUser(): Promise<User> {
    return fetchWithAuth('/auth/me');
  },
};

// Opportunities API
export const opportunitiesApi = {
  async list(params?: {
    zip_code?: string;
    skills?: string;
    cause_area?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<OpportunityListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    return fetchWithAuth(`/opportunities/?${queryParams}`);
  },

  async getFeatured(): Promise<Opportunity[]> {
    return fetchWithAuth('/opportunities/featured');
  },

  async getById(id: string): Promise<OpportunityDetail> {
    return fetchWithAuth(`/opportunities/${id}`);
  },

  async apply(opportunityId: string, roleId: number, data: {
    cover_letter?: string;
    availability_notes?: string;
  }): Promise<ApplicationResponse> {
    return fetchWithAuth(`/opportunities/${opportunityId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId, ...data }),
    });
  },
};