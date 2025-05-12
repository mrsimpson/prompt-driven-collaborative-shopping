import { useEffect, useState } from 'react';
import { ServiceFactory } from '@/src/services';

/**
 * Hook for initializing the application
 * This should be used in the root component to ensure the app is properly initialized
 * @returns Object with initialization state
 */
export function useAppInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const userService = ServiceFactory.getUserService();
        
        // Initialize the app (database, etc.)
        await userService.initializeApp();
        
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize app'));
        console.error('Error initializing app:', err);
      }
    };
    
    initialize();
  }, []);
  
  return { isInitialized, error };
}
