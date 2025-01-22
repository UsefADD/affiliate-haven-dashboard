import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ClickTracker({ offerId, affiliateId, targetUrl }: { 
  offerId: string;
  affiliateId: string;
  targetUrl: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const trackClick = async () => {
      try {
        console.log("Tracking click for offer:", offerId, "affiliate:", affiliateId);
        
        const { error } = await supabase
          .from('affiliate_clicks')
          .insert({
            offer_id: offerId,
            affiliate_id: affiliateId,
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip),
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
        // Redirect anyway in case of error
        window.location.href = targetUrl;
      }
    };

    trackClick();
  }, [offerId, affiliateId, targetUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you to the offer.</p>
      </div>
    </div>
  );
}