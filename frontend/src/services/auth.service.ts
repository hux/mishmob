import { authApi, User, LoginCredentials, RegisterData, tokenManager } from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    return authApi.register(data);
  },

  /**
   * Login user and store tokens
   */
  async login(username: string, password: string) {
    const credentials: LoginCredentials = { username, password };
    return authApi.login(credentials);
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    return authApi.logout();
  },

  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<User> {
    return authApi.getCurrentUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return tokenManager.getToken();
  },
};