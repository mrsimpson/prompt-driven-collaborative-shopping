import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  isLocalMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // We'll add more methods when implementing Supabase auth
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLocalMode: true,
  login: async () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // In this local-first implementation, we'll always start in local mode
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(true);

  // Mock login function (will be replaced with Supabase auth later)
  const login = async (email: string, password: string) => {
    // For now, we'll just simulate a successful login
    // In the future, this will integrate with Supabase
    setIsAuthenticated(true);
    setIsLocalMode(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocalMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLocalMode,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
