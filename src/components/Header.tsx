import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, isAdmin = false }) => {
  const { user, logout } = useAuth(); // Use AuthContext to get user information and logout function

  // Use useNavigate hook from react-router-dom for navigation
  const navigate = useNavigate();

  const location = useLocation(); // Get the current location to determine the path

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b px-4" style={{ maxHeight: '130px' }}>
      <div className="flex-col w-full">
        <div className='flex flex-row items-center justify-between gap-4 sm:gap-0'>
          <div className="flex flex-row items-center gap-5">
            {/* Logo leading to homepage*/}
            <Link to={user?.role === "security" ? "/securityDashboard" : "/"} className="flex-shrink-0">
              <img 
              src="/messe-muenchen-logo.png" 
              alt="Messe München Logo" 
              className="h-20 w-auto"
              />
            </Link>
            
            <div className="border-l h-12 border-gray-300 mx-2 hidden sm:block"></div>
            <h2 className="text-center sm:text-left text-lg sm:text-2xl">{title}</h2>
            {/* Subtitle section, only visible on larger screens */}
            {subtitle && (
              <div className="items-center sm:ml-2 sm:border-l sm:border-gray-300 sm:pl-2 sm:flex hidden">
                <Clock className="w-4 h-4 mr-1" />
                <h3 className="inline-flex items-center font-bold text-center sm:text-left">
                  {subtitle}
                </h3>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {user?.isAuthenticated ? ( // Check if user is authenticated
              location.pathname === '/' ? ( // If on the home page, show admin settings link
                <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                </Link>
                ) : location.pathname === '/securityDashboard' ? (
              <Link to="/security">
                <Settings className="h-4 w-4 mr-2" />
              </Link>
              ) : ( //if user is authenticated, show logout button
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Abmelden
              </Button>
              )
            ) : (
              <Link to="/login">
              <LogIn className="h-5 w-5 mr-2" />
              </Link>
            )}
          </div>
        </div>
        {/* Subtitle section, only visible on larger screens */}
          {subtitle && (
            <div className="flex items-center sm:ml-2 sm:border-l sm:border-gray-300 sm:pl-2 sm:hidden flex">
              <Clock className="w-4 h-4 mr-1" />
                <h3 className="inline-flex items-center font-light text-center sm:text-left text-sm">
                {subtitle}
                </h3>
            </div>
          )}
      </div>
    </header>
  );
};

export default Header;
