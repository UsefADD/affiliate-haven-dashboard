import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Campaigns from "@/pages/Campaigns";
import Reports from "@/pages/Reports";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminOffers from "@/pages/admin/Offers";
import AdminUsers from "@/pages/admin/Users";
import AdminLeads from "@/pages/admin/Leads";
import AdminClicks from "@/pages/admin/Clicks";
import { TrackingRedirect } from "@/components/tracking/TrackingRedirect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/offers" element={<AdminOffers />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/leads" element={<AdminLeads />} />
      <Route path="/admin/clicks" element={<AdminClicks />} />
      <Route path="/track/:offerId/:affiliateId" element={<TrackingRedirect />} />
    </Routes>
  );
}

export default App;