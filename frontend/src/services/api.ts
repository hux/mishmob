// API configuration and base client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
  organization_id?: number;
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
  match_score?: number;
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

export interface CreateOpportunityData {
  title: string;
  description: string;
  cause_area: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  location_zip: string;
  is_remote: boolean;
  impact_statement: string;
  requirements: string;
  time_commitment: string;
  roles: CreateRoleData[];
}

export interface CreateRoleData {
  title: string;
  description: string;
  responsibilities?: string;
  slots_available: number;
  time_commitment?: string;
  required_skills: string[];
  developed_skills?: string[];
}

export interface HostProfileData {
  organization_name: string;
  organization_type?: string;
  website?: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
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
  
  console.log('fetchWithAuth called:', { url, hasToken: !!token });
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.detail || errorText;
    } catch {
      // Keep original text if not JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  const data = await response.json();
  console.log('fetchWithAuth returning:', { url, data });
  return data;
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

  async createOrUpdateHostProfile(data: HostProfileData): Promise<{
    message: string;
    organization_id: number;
    organization_name: string;
  }> {
    return fetchWithAuth('/auth/host-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Skills API
export interface SkillInfo {
  id: number;
  name: string;
  category: string;
}

export interface UserSkillInfo {
  id: number;
  skill: SkillInfo;
  proficiency_level?: string;
  is_verified?: boolean;
}

export const skillsApi = {
  async getAllSkills(): Promise<SkillInfo[]> {
    return fetchWithAuth('/skills/all');
  },

  async searchSkills(query: string): Promise<SkillInfo[]> {
    return fetchWithAuth(`/skills/search?q=${encodeURIComponent(query)}`);
  },

  async getMySkills(): Promise<UserSkillInfo[]> {
    return fetchWithAuth('/skills/my-skills');
  },

  async addSkill(skillName: string, proficiencyLevel?: string): Promise<any> {
    return fetchWithAuth('/skills/add', {
      method: 'POST',
      body: JSON.stringify({
        skill_name: skillName,
        proficiency_level: proficiencyLevel || 'intermediate',
      }),
    });
  },

  async removeSkill(skillId: number): Promise<any> {
    return fetchWithAuth('/skills/remove', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    });
  },

  async updateProficiency(skillId: number, proficiencyLevel: string): Promise<any> {
    return fetchWithAuth(`/skills/update-proficiency?skill_id=${skillId}&proficiency_level=${proficiencyLevel}`, {
      method: 'POST',
    });
  },

  async getPopularSkills(limit?: number): Promise<Array<{ skill: SkillInfo; user_count: number }>> {
    return fetchWithAuth(`/skills/popular?limit=${limit || 10}`);
  },
};

// Opportunities API
export const opportunitiesApi = {
  async list(params?: {
    zip_code?: string;
    skills?: string;
    cause_area?: string;
    remote_only?: boolean;
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

  async create(data: CreateOpportunityData): Promise<{
    message: string;
    opportunity_id: string;
    status: string;
  }> {
    return fetchWithAuth('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async publish(opportunityId: string): Promise<{
    message: string;
    opportunity_id: string;
  }> {
    return fetchWithAuth(`/opportunities/${opportunityId}/publish`, {
      method: 'POST',
    });
  },

  async getRecommendations(params?: {
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
    
    return fetchWithAuth(`/opportunities/recommendations?${queryParams}`);
  },

  async getMatchScore(opportunityId: string): Promise<{
    match_score: number;
    required_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
    user_has_skills: boolean;
  }> {
    return fetchWithAuth(`/opportunities/${opportunityId}/match-score`);
  },
};

// Messages API
export interface MessageUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  user_type: string;
  is_online: boolean;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: MessageUser;
  content: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  attachment?: string;
  attachment_name?: string;
}

export interface Conversation {
  id: number;
  subject: string;
  is_group: boolean;
  participants: MessageUser[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  has_more: boolean;
}

export interface CreateConversationRequest {
  participant_ids: number[];
  subject?: string;
  initial_message: string;
}

export const messagesApi = {
  async getConversations(page: number = 1, search?: string): Promise<ConversationListResponse> {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    return fetchWithAuth(`/messages/conversations?${params}`);
  },

  async getMessages(conversationId: number, beforeId?: number, limit: number = 50): Promise<MessageListResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append('before_id', beforeId.toString());
    return fetchWithAuth(`/messages/conversations/${conversationId}/messages?${params}`);
  },

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    return fetchWithAuth(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return fetchWithAuth('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markConversationRead(conversationId: number): Promise<{ success: boolean; marked_count: number }> {
    return fetchWithAuth(`/messages/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  async searchUsers(query: string): Promise<MessageUser[]> {
    return fetchWithAuth(`/messages/users/search?q=${encodeURIComponent(query)}`);
  },
};

// LMS API
export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  audience_type: string;
  difficulty_level: string;
  estimated_duration: number;
  category?: string;
  thumbnail_url?: string;
  is_published: boolean;
  is_enrolled: boolean;
  progress_percentage?: number;
  modules_count: number;
  enrolled_count: number;
}

export interface Module {
  id: number;
  title: string;
  content_type: string;
  duration: number;
  display_order: number;
  is_completed?: boolean;
  quiz_id?: number;
}

export interface CourseDetail extends CourseListItem {
  created_by?: string;
  created_at: string;
  modules: Module[];
  provides_certificate: boolean;
  passing_score: number;
  tags?: string;
}

export interface Enrollment {
  course_id: string;
  course_title: string;
  enrolled_at: string;
  completion_status: string;
  progress_percentage: number;
  last_accessed?: string;
  certificate_issued: boolean;
  certificate_id?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes?: number;
  questions_count: number;
  total_points: number;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  answers?: {
    id: number;
    answer_text: string;
    order: number;
  }[];
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  remaining_attempts: number;
}

export interface Certificate {
  certificate_id: string;
  user_name: string;
  course_title: string;
  completion_date: string;
  issued_date: string;
  final_score?: number;
  verification_url: string;
}

export const lmsApi = {
  async getCourses(filters?: {
    audience_type?: string;
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<CourseListItem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return fetchWithAuth(`/lms/courses?${params}`);
  },

  async getCourseDetail(courseId: string): Promise<CourseDetail> {
    return fetchWithAuth(`/lms/courses/${courseId}`);
  },

  async enrollInCourse(courseId: string): Promise<{ message: string; enrollment_id: number }> {
    return fetchWithAuth(`/lms/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  },

  async getMyEnrollments(status?: string): Promise<Enrollment[]> {
    const params = status ? `?status=${status}` : '';
    return fetchWithAuth(`/lms/enrollments${params}`);
  },

  async getModuleContent(moduleId: number): Promise<{
    module: {
      id: number;
      title: string;
      content: string;
      content_type: string;
      video_url?: string;
      duration: number;
    };
    progress: {
      completed: boolean;
      time_spent: number;
      quiz_score?: number;
    };
    has_quiz: boolean;
  }> {
    return fetchWithAuth(`/lms/modules/${moduleId}`);
  },

  async updateProgress(moduleId: number, completed: boolean, timeSpentSeconds?: number): Promise<{
    message: string;
    course_progress: number;
    course_completed: boolean;
  }> {
    return fetchWithAuth('/lms/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        module_id: moduleId,
        completed,
        time_spent_seconds: timeSpentSeconds,
      }),
    });
  },

  async getQuiz(moduleId: number): Promise<Quiz> {
    return fetchWithAuth(`/lms/modules/${moduleId}/quiz`);
  },

  async getQuizQuestions(quizId: number): Promise<Question[]> {
    return fetchWithAuth(`/lms/quizzes/${quizId}/questions`);
  },

  async startQuizAttempt(quizId: number): Promise<QuizAttempt> {
    return fetchWithAuth(`/lms/quizzes/${quizId}/start`, {
      method: 'POST',
    });
  },

  async submitQuiz(attemptId: number, answers: any[]): Promise<{
    score: number;
    passed: boolean;
    passing_score: number;
    show_correct_answers: boolean;
  }> {
    return fetchWithAuth(`/lms/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  async getCertificate(certificateId: string): Promise<Certificate> {
    return fetchWithAuth(`/lms/certificates/${certificateId}`);
  },
};