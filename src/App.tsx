
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

// Lazy load components with proper error boundaries
const AffiliateApplicationForm = lazy(() => import("@/components/affiliate/AffiliateApplicationForm"));
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary component
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
    <div className="text-center space-y-4">
      <p className="text-red-600">There was an error loading this page.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

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
    return <LoadingFallback />;
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
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary fallback={<ErrorFallback />}>
                <AffiliateApplicationForm 
                  onSuccess={() => {
                    window.location.href = "/login";
                  }} 
                  onCancel={() => {
                    window.location.href = "/login";
                  }} 
                />
              </ErrorBoundary>
            </Suspense>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary fallback={<ErrorFallback />}>
                <ForgotPassword />
              </ErrorBoundary>
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default App;
