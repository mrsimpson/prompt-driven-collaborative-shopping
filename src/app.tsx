import React, { useEffect } from 'react';
import { db } from './stores/database';

/**
 * Main application component that initializes the database
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the database when the app starts
    const initDb = async () => {
      try {
        await db.initializeDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDb();
  }, []);

  return <>{children}</>;
}
