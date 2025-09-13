import { apiClient, LoginResponse, RegisterData, User } from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and store tokens
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user_id', response.data.user_id);
    localStorage.setItem('user_type', response.data.user_type);
    
    return response.data;
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
    
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_type');
  },

  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored user type
   */
  getUserType(): string | null {
    return localStorage.getItem('user_type');
  },

  /**
   * Get stored user ID
   */
  getUserId(): string | null {
    return localStorage.getItem('user_id');
  },
};