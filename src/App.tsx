import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Users from "./pages/admin/Users";
import Offers from "./pages/admin/Offers";
import Leads from "./pages/admin/Leads";
import AdminDashboard from "./pages/admin/Dashboard";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsAuthorized(false);
        return;
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      if (!session) {
        setIsAuthorized(false);
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user) {
        setIsAuthorized(false);
        return;
      }

      try {
        console.log("Checking user role for:", session.user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setIsAuthorized(false);
          return;
        }

        console.log("User profile:", profile);
        setIsAuthorized(!requireAdmin || profile?.role === 'admin');
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        setIsAuthorized(false);
      }
    };

    if (session?.user) {
      checkUserRole();
    }
  }, [session, requireAdmin]);

  if (isAuthorized === null) {
    return null; // Loading state
  }

  if (!session || !isAuthorized) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/offers"
            element={
              <ProtectedRoute requireAdmin>
                <Offers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute requireAdmin>
                <Leads />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;