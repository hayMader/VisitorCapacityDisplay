import React, { createContext, useContext, useEffect, useState } from 'react';
import {AuthContextType, AuthUser} from '@/types/index'


const defaultAuthContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  getCurrentUser: () => null,
  isLoading: true, // Default to loading
};

/*---- 
  Context to provide all data and interaction functions authentification 
  used in different parts of the project where interaction with this data is necessary
----*/

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // states
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch current user on load
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser)
  }, []);

  //function to load current user information from browser cookie
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

  //save authentificated user info to browser cookie
  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('auth', JSON.stringify(userData));
  };

  //remove authentificated user info from browser cookie
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
