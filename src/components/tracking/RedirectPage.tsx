import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function RedirectPage() {
  const { affiliateId, offerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const trackAndRedirect = async () => {
      try {
        if (!affiliateId || !offerId) {
          console.error("Missing parameters:", { affiliateId, offerId });
          navigate("/");
          return;
        }

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
        const { data: offer, error: offerError } = await supabase
          .from('offers')
          .select('links')
          .eq('id', offerId)
          .maybeSingle();

        if (offerError) {
          console.error('Error fetching offer:', offerError);
          navigate("/");
          return;
        }

        if (!offer?.links?.[0]) {
          console.error('No destination URL found for offer');
          navigate("/");
          return;
        }

        // Immediately redirect to the destination URL
        const url = offer.links[0];
        const destinationUrl = url.startsWith('http') ? url : `https://${url}`;
        window.location.href = destinationUrl;

      } catch (error) {
        console.error('Error in trackAndRedirect:', error);
        navigate("/");
      }
    };

    trackAndRedirect();
  }, [affiliateId, offerId, navigate, toast]);

  // Show nothing while processing
  return null;
}