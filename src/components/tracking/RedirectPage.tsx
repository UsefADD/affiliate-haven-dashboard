import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RedirectPage() {
  const { affiliateId, offerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const trackClickAndRedirect = async () => {
      if (!affiliateId || !offerId) {
        console.error("Missing required parameters");
        navigate("/");
        return;
      }

      try {
        // Record the click
        const { error: clickError } = await supabase.functions.invoke('track-click', {
          body: { affiliateId, offerId }
        });

        if (clickError) {
          console.error('Error recording click:', clickError);
        }

        // Get the offer links and affiliate's subdomain
        const [offerResponse, profileResponse] = await Promise.all([
          supabase
            .from('offers')
            .select('links')
            .eq('id', offerId)
            .single(),
          supabase
            .from('profiles')
            .select('subdomain')
            .eq('id', affiliateId)
            .single()
        ]);

        if (offerResponse.error || !offerResponse.data?.links?.[0]) {
          console.error('Error fetching offer:', offerResponse.error);
          navigate("/");
          return;
        }

        let destinationUrl = offerResponse.data.links[0];

        // Add subdomain if available
        if (!profileResponse.error && profileResponse.data?.subdomain) {
          try {
            const url = new URL(destinationUrl);
            url.hostname = `${profileResponse.data.subdomain}.${url.hostname}`;
            destinationUrl = url.toString();
          } catch (error) {
            console.error('Error processing URL:', error);
          }
        }

        // Redirect to the destination URL
        window.location.href = destinationUrl;
      } catch (error) {
        console.error('Error in redirect process:', error);
        navigate("/");
      }
    };

    trackClickAndRedirect();
  }, [affiliateId, offerId, navigate]);

  return null;
}