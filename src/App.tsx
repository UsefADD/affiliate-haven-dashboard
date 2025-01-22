import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ClickTracker } from "@/components/tracking/ClickTracker";
import Campaigns from "@/pages/Campaigns";
import Index from "@/pages/Index";
import Reports from "@/pages/Reports";
import Offers from "@/pages/admin/Offers";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/offers" element={<Offers />} />
        <Route 
          path="/track/:offerId/:affiliateId" 
          element={
            <ClickTracker 
              offerId={useParams().offerId || ''} 
              affiliateId={useParams().affiliateId || ''} 
              targetUrl={new URLSearchParams(useLocation().search).get('target') || ''}
            />
          } 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}
