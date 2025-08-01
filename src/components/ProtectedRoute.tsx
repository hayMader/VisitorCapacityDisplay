import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// This component is used to protect routes that require authentication and wraps the children components.
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { getCurrentUser } = useAuth();

  const user = getCurrentUser();

  // Redirect to login if not authenticated
  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
