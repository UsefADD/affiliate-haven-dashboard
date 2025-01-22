import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClickTrackerProps {
  offerId: string;
  affiliateId: string;
  targetUrl: string;
}

export function ClickTracker({ offerId, affiliateId, targetUrl }: ClickTrackerProps) {
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const trackClick = async () => {
      try {
        console.log("Tracking click for:", {
          offerId,
          affiliateId,
          targetUrl
        });

        // Record the click in the database
        const { error } = await supabase
          .from('affiliate_clicks')
          .insert({
            offer_id: offerId,
            affiliate_id: affiliateId,
            ip_address: "Tracked on client", // For privacy, we don't track real IP
            user_agent: navigator.userAgent,
            referrer: document.referrer
          });

        if (error) {
          console.error('Error tracking click:', error);
        }

        // Redirect to the target URL
        window.location.href = targetUrl;
      } catch (error) {
        console.error('Error in click tracking:', error);
        // Redirect anyway even if tracking fails
        window.location.href = targetUrl;
      }
    };

    if (isRedirecting) {
      trackClick();
    }
  }, [offerId, affiliateId, targetUrl, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirecting...</h2>
        <p className="text-gray-600">You are being redirected to the offer.</p>
      </div>
    </div>
  );
}