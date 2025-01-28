import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Campaigns from "./pages/Campaigns";
import { AdminDashboard, AdminUsers, AdminOffers, AdminLeads } from "./pages/admin";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { RedirectPage } from "@/components/tracking/RedirectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/track/:affiliateId/:offerId" element={<RedirectPage />} />
        
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