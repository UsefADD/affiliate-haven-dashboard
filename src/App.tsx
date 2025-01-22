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
        console.log("Checking authentication status...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }

        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User verification failed:", userError);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }

        console.log("Active session verified for user:", user.id);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        await supabase.auth.signOut();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error("User verification failed after state change:", userError);
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            return;
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth verification error:', error);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
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