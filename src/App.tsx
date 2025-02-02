import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { lazy, Suspense } from "react";

// Lazy load these components as they're not needed for initial login
const AffiliateApplicationForm = lazy(() => import("@/components/affiliate/AffiliateApplicationForm"));
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Auth Required */}
        <Route path="/login" element={<Login />} />
        <Route path="/track/:affiliateId/:offerId" element={<RedirectPage />} />
        <Route 
          path="/affiliate-application" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <AffiliateApplicationForm onSuccess={() => {}} onCancel={() => {}} />
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
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/campaigns" element={<Campaigns />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/offers" element={<AdminRoute><AdminOffers /></AdminRoute>} />
        <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;