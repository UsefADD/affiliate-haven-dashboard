import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import Reports from "@/pages/Reports";
import Campaigns from "@/pages/Campaigns";
import Profile from "@/pages/Profile";
// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminOffers from "@/pages/admin/Offers";
import AdminLeads from "@/pages/admin/Leads";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Starting authentication check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User verification failed:", userError);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log("Active session verified for user:", user.id);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("User signed in or token refreshed");
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("Protected route state:", { isAuthenticated, isLoading });
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  console.log("App component rendering");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/offers" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;