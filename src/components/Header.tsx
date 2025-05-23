import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, isAdmin = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b px-4 py-3" style={{ maxHeight: '10vh' }}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/messe-muenchen-logo.png" 
              alt="Messe München Logo" 
              className="h-12"
            />
          </Link>
          
          <div className="border-l h-12 border-gray-300 mx-2"></div>
          
          <div>
            <h1 className="text-xl font-medium">{title}</h1>
            {subtitle && (
              <div className="flex items-center text-gray-600">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {subtitle}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user?.isAuthenticated ? (
            window.location.pathname === '/' ? (
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            )
          ) : (
            <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
