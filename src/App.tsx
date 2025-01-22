import { BrowserRouter as Router, Routes, Route, useParams, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ClickTracker } from "@/components/tracking/ClickTracker";
import Campaigns from "@/pages/Campaigns";
import Index from "@/pages/Index";
import Reports from "@/pages/Reports";
import Offers from "@/pages/admin/Offers";

function TrackingRoute() {
  const { offerId = '', affiliateId = '' } = useParams();
  const location = useLocation();
  const targetUrl = new URLSearchParams(location.search).get('target') || '';
  
  return (
    <ClickTracker 
      offerId={offerId}
      affiliateId={affiliateId}
      targetUrl={targetUrl}
    />
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/offers" element={<Offers />} />
        <Route path="/track/:offerId/:affiliateId" element={<TrackingRoute />} />
      </Routes>
      <Toaster />
    </Router>
  );
}