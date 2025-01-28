import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RedirectPage() {
  const [countdown, setCountdown] = useState(3);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const { affiliateId, offerId } = useParams();

  useEffect(() => {
    const trackClick = async () => {
      try {
        console.log("Recording click for:", { affiliateId, offerId });
        
        // Record the click
        const { error: clickError } = await supabase.functions.invoke('track-click', {
          body: { 
            affiliateId, 
            offerId,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          }
        });

        if (clickError) {
          console.error('Error recording click:', clickError);
        }

        // Get the destination URL
        const { data: offer } = await supabase
          .from('offers')
          .select('links')
          .eq('id', offerId)
          .single();

        if (offer?.links?.[0]) {
          const url = offer.links[0];
          setDestinationUrl(url.startsWith('http') ? url : `https://${url}`);
        }
      } catch (error) {
        console.error('Error in trackClick:', error);
      }
    };

    trackClick();
  }, [affiliateId, offerId]);

  useEffect(() => {
    if (!destinationUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = destinationUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [destinationUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-lg bg-white/50 backdrop-blur-sm shadow-lg border">
        <h1 className="text-2xl font-bold text-green-600">Please wait...</h1>
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">
          You will be redirected in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}