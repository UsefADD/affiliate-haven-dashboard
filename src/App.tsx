
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Campaigns from "./pages/Campaigns";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminOffers from "./pages/admin/Offers";
import AdminLeads from "./pages/admin/Leads";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { RedirectPage } from "@/components/tracking/RedirectPage";
import { useNavigate } from "react-router-dom";

// Lazy load these components as they're not needed for initial login
const AffiliateApplicationForm = lazy(() => import("@/components/affiliate/AffiliateApplicationForm"));
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Auth Required */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route path="/track/:affiliateId/:offerId" element={<RedirectPage />} />
        <Route 
          path="/affiliate-application" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <AffiliateApplicationForm 
                onSuccess={() => {
                  window.location.href = "/login";
                }} 
                onCancel={() => {
                  window.location.href = "/login";
                }} 
              />
            </Suspense>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ForgotPassword />
            </Suspense>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Index /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/reports" 
          element={isAuthenticated ? <Reports /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/campaigns" 
          element={isAuthenticated ? <Campaigns /> : <Navigate to="/login" replace />} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<AdminRoute><AdminDashboard /></AdminRoute>} 
        />
        <Route 
          path="/admin/users" 
          element={<AdminRoute><AdminUsers /></AdminRoute>} 
        />
        <Route 
          path="/admin/offers" 
          element={<AdminRoute><AdminOffers /></AdminRoute>} 
        />
        <Route 
          path="/admin/leads" 
          element={<AdminRoute><AdminLeads /></AdminRoute>} 
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
