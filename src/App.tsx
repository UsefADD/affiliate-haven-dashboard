import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Reports from "@/pages/Reports";
import Campaigns from "@/pages/Campaigns";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminOffers from "@/pages/admin/Offers";
import AdminLeads from "@/pages/admin/Leads";
import Redirect from "@/pages/Redirect";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/offers" element={<AdminOffers />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/redirect/:affiliateId/:offerId" element={<Redirect />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;