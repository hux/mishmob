import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Get API URL based on platform and device type
const getApiUrl = async () => {
  // For development, use localhost for iOS simulator
  if (Platform.OS === 'ios') {
    const isSimulator = await DeviceInfo.isEmulator();
    if (isSimulator) {
      return 'http://localhost:8001/api';
    }
    // For physical iOS device, use your computer's IP
    // Find with: ifconfig | grep "inet " | grep -v 127.0.0.1
    return 'http://192.168.1.170:8001/api'; // Update this to your computer's IP
  }
  
  // Android emulator needs special IP to access host machine
  if (Platform.OS === 'android') {
    const isEmulator = await DeviceInfo.isEmulator();
    if (isEmulator) {
      return 'http://10.0.2.2:8001/api';
    }
    // For physical Android device, use your computer's IP
    return 'http://192.168.1.170:8001/api'; // Update this to your computer's IP
  }
  
  // Fallback
  return 'http://localhost:8001/api';
};

// Initialize API URL (will be set asynchronously)
let API_BASE_URL = 'http://localhost:8001/api';

// Initialize the API URL
getApiUrl().then(url => {
  API_BASE_URL = url;
  console.log('API_BASE_URL initialized:', API_BASE_URL);
}).catch(error => {
  console.error('Failed to initialize API URL:', error);
  API_BASE_URL = 'http://localhost:8080/api'; // fallback
});

// Re-export types from shared (when available)
// export * from 'api-types';

// Token management using AsyncStorage
export const tokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },
  
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to set token:', error);
      throw error;
    }
  },
  
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
      throw error;
    }
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

// Events API
export const eventsApi = {
  async getMyTickets() {
    return fetchWithAuth('/events/my-tickets');
  },
  
  async registerForEvent(opportunityId: string, deviceInfo?: any) {
    return fetchWithAuth(`/opportunities/${opportunityId}/register-for-event`, {
      method: 'POST',
      body: JSON.stringify(deviceInfo || {}),
    });
  },
};

// Tickets API
export const ticketsApi = {
  async getQRCode(ticketId: string) {
    return fetchWithAuth(`/tickets/${ticketId}/qr-code`);
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