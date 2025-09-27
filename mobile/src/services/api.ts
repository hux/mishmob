import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL from environment or use default
// For Android emulator, localhost refers to the emulator itself, not the host machine
// Use 10.0.2.2 for Android emulator to access host machine's localhost
const getApiUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // For physical devices and simulators, use your computer's IP
  // You can find this with: ifconfig | grep "inet " | grep -v 127.0.0.1
  const HOST_IP = '192.168.1.170'; // Update this to your computer's IP
  
  // Android emulator needs special IP to access host machine
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:8090/api';
  }
  
  // iOS simulator can use localhost
  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return 'http://localhost:8090/api';
  }
  
  // Physical device needs actual IP
  return `http://${HOST_IP}:8090/api`;
};

const API_BASE_URL = getApiUrl();
console.log('API_BASE_URL:', API_BASE_URL);

// Re-export types from shared
export * from 'api-types';

// Token management using SecureStore
export const tokenManager = {
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('auth_token');
  },
  
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
  },
  
  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  },
};

// Base fetch function with timeout
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await tokenManager.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('Making request to:', fullUrl);
  console.log('Request method:', options.method || 'GET');
  console.log('Request body:', options.body);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Request failed:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - check if backend is running on port 8080');
    }
    throw error;
  }
}

// Auth API
export const authApi = {
  async login(username: string, password: string) {
    console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
    try {
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.access_token) {
        throw new Error('No access token received');
      }
      
      await tokenManager.setToken(response.access_token);
      return response;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw error;
    }
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

// Tickets API
export const ticketsApi = {
  async getQRCode(qrData: string) {
    return fetchWithAuth(`/tickets/qr/${encodeURIComponent(qrData)}`);
  },
};

// User Verification API
export const verificationApi = {
  async verifyIdentity(idImageUri: string, selfieImageUri: string) {
    const formData = new FormData();
    formData.append('id_image', {
      uri: idImageUri,
      type: 'image/jpeg',
      name: 'id.jpg',
    } as any);
    formData.append('selfie_image', {
      uri: selfieImageUri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    } as any);

    const token = await tokenManager.getToken();
    const response = await fetch(`${API_BASE_URL}/users/verify-identity`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async getVerificationStatus() {
    return fetchWithAuth('/users/verification-status');
  },
};