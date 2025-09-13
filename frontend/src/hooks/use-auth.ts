import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Hook to require authentication for a page
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require a specific user type
 * Redirects to home if user doesn't have the required type
 */
export function useRequireUserType(requiredType: 'volunteer' | 'host' | 'admin') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && user.user_type !== requiredType) {
      navigate('/');
    }
  }, [user, isLoading, navigate, requiredType]);

  return { user, isLoading, hasRequiredType: user?.user_type === requiredType };
}

/**
 * Hook to redirect authenticated users away from auth pages
 */
export function useRedirectIfAuthenticated(redirectTo = '/dashboard') {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on user type
      if (user.user_type === 'volunteer') {
        navigate('/dashboard');
      } else if (user.user_type === 'host') {
        navigate('/host-dashboard');
      } else {
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}