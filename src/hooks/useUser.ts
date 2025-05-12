import { useState, useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/src/services';
import { User } from '@/src/types/models';
import { useAuth } from '@/src/contexts/AuthContext';

/**
 * Hook for managing user data and initialization
 * @returns Object with user data, loading state, error state, and functions to manage user
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { isAuthenticated, isLocalMode } = useAuth();
  const userService = ServiceFactory.getUserService();
  
  // Initialize the app and get the current user
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize the app (database, etc.)
      await userService.initializeApp();
      setIsInitialized(true);
      
      // In local mode or when authenticated, get the current user
      if (isLocalMode || isAuthenticated) {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize app'));
      console.error('Error initializing app:', err);
    } finally {
      setLoading(false);
    }
  }, [isLocalMode, isAuthenticated, userService]);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    try {
      setError(null);
      const updatedUser = await userService.updateUser(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user profile'));
      console.error('Error updating user profile:', err);
      throw err;
    }
  }, [user, userService]);
  
  return {
    user,
    loading,
    error,
    isInitialized,
    initialize,
    updateProfile
  };
}
