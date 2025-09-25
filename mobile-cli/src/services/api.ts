import * as Keychain from 'react-native-keychain';
import Config from 'react-native-config';

// Get API URL from environment or use default
const API_BASE_URL = Config.API_URL || 'http://localhost:8000/api';

// Re-export types from shared
export * from '@shared/api-types';

// Token management using Keychain
export const tokenManager = {
  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('mishmob_api');
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },
  
  async setToken(token: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'mishmob_api',
        'token',
        token
      );
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  },
  
  async removeToken(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('mishmob_api');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },
};

// Base fetch function
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await tokenManager.getToken();
  
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
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  async login(username: string, password: string) {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    await tokenManager.setToken(response.access_token);
    return response;
  },

  async register(data: any) {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
    await tokenManager.removeToken();
  },

  async getCurrentUser() {
    return fetchWithAuth('/auth/me');
  },
};

// Opportunities API
export const opportunitiesApi = {
  async list(params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return fetchWithAuth(`/opportunities/?${queryParams}`);
  },

  async getFeatured() {
    return fetchWithAuth('/opportunities/featured');
  },

  async getById(id: string) {
    return fetchWithAuth(`/opportunities/${id}`);
  },
};