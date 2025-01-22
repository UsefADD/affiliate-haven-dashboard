import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function TrackingRedirect() {
  const { offerId, affiliateId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('target');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (!offerId || !affiliateId || !targetUrl) {
          console.error("Missing required tracking parameters");
          window.location.href = '/';
          return;
        }

        console.log("Recording click for:", { offerId, affiliateId, targetUrl });

        // Record the click
        const { error: clickError } = await supabase
          .from('affiliate_clicks')
          .insert({
            offer_id: offerId,
            affiliate_id: affiliateId,
            ip_address: "Tracked on client",
            user_agent: navigator.userAgent,
            referrer: document.referrer
          });

        if (clickError) {
          console.error("Error recording click:", clickError);
        }

        // Redirect to the target URL
        window.location.href = decodeURIComponent(targetUrl);
      } catch (error) {
        console.error('Error in click tracking:', error);
        window.location.href = '/';
      }
    };

    handleRedirect();
  }, [offerId, affiliateId, targetUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirecting...</h2>
        <p className="text-gray-600">You are being redirected to the offer.</p>
      </div>
    </div>
  );
}