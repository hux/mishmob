import axios, { AxiosError, AxiosInstance } from 'axios';

// API Base URL - using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Type definitions for API responses
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

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  email: string;
  user_type: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type?: string;
  zip_code?: string;
}

export interface OpportunityListItem {
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

export interface OpportunityListResponse {
  results: OpportunityListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface OpportunityDetail extends OpportunityListItem {
  location_name: string;
  location_address: string;
  cause_area: string;
  time_commitment: string;
  impact_statement: string;
  requirements: string;
  view_count: number;
  roles: Role[];
  host_info: HostInfo;
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
  required_skills: Skill[];
  developed_skills: Skill[];
}

export interface Skill {
  name: string;
  category: string;
}

export interface HostInfo {
  id: number;
  name: string;
  website: string;
  description: string;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
}

export interface ApplicationData {
  role_id: number;
  cover_letter?: string;
  availability_notes?: string;
}

// API error handling utility
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    } else if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}