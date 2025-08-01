import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";
import SecurityDashboard from "./pages/SecurityDashboard";
import { AreaStatusProvider } from "./contexts/AreaStatusContext";
import { useEffect } from "react";


const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth(); // Get the logged-in user details
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User role:", user?.role);
    if (user?.role === "security") {
      navigate("/securityDashboard"); // Redirect to /securityDashboard if the user's role is "security"
    }
  }, [user]);

  // Define the routes for the application
  return (
    <Routes>
      <Route path="/" element={<Index />} /> {/* Default route */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/security" element={
        <ProtectedRoute>
          <Security />
        </ProtectedRoute>
      } />
      <Route path="/securityDashboard" element={
        <ProtectedRoute>
          <SecurityDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component that wraps the application with necessary providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AreaStatusProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </AreaStatusProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
