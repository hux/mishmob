import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export const useErrorHandler = () => {
  const queryClient = useQueryClient();

  const handleError = (error: AppError, context?: string) => {
    console.error(`Error in ${context || 'app'}:`, error);

    // Handle different types of errors
    if (error.status === 401) {
      // Unauthorized - clear cache and redirect to login
      queryClient.clear();
      Alert.alert(
        'Session Expired',
        'Please log in again to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (error.status === 403) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to perform this action.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (error.status === 429) {
      Alert.alert(
        'Rate Limit Exceeded',
        'Please wait a moment before trying again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (error.status >= 500) {
      Alert.alert(
        'Server Error',
        'Our servers are experiencing issues. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Network errors
    if (error.message.includes('Network') || error.message.includes('timeout')) {
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Default error handling
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred.',
      [{ text: 'OK' }]
    );
  };

  // Set up global error handler for React Query
  useEffect(() => {
    const defaultErrorHandler = (error: AppError) => {
      handleError(error, 'React Query');
    };

    queryClient.setDefaultOptions({
      queries: {
        retry: (failureCount, error: AppError) => {
          // Don't retry on auth errors
          if (error.status === 401 || error.status === 403) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        onError: defaultErrorHandler,
      },
      mutations: {
        retry: (failureCount, error: AppError) => {
          // Don't retry mutations by default
          return false;
        },
        onError: defaultErrorHandler,
      },
    });
  }, [queryClient]);

  return { handleError };
};

export default useErrorHandler;