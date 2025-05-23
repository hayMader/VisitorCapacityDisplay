import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
  isAuthenticated: boolean;
  username: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  getCurrentUser: () => AuthUser | null;
  isLoading: boolean; // Add loading state
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  getCurrentUser: () => null,
  isLoading: true, // Default to loading
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser)
  }, []);

  const getCurrentUser = () => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated) {
          return authData;
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('auth');
      }
    }
  };

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('auth', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
