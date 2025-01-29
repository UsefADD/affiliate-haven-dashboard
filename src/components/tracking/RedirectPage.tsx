import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RedirectPage() {
  const { affiliateId, offerId } = useParams();

  useEffect(() => {
    const trackAndRedirect = async () => {
      try {
        if (!affiliateId || !offerId) {
          console.error("Missing parameters:", { affiliateId, offerId });
          return;
        }

        // Get IP address for duplicate click checking
        const ipAddress = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);

        // Check for duplicate clicks
        const { data: existingClicks } = await supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .eq('offer_id', offerId)
          .eq('ip_address', ipAddress)
          .gte('clicked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!existingClicks || existingClicks.length === 0) {
          // Record the click
          await supabase
            .from('affiliate_clicks')
            .insert({
              affiliate_id: affiliateId,
              offer_id: offerId,
              ip_address: ipAddress,
              referrer: document.referrer,
              user_agent: navigator.userAgent
            });
        }

        // Get the destination URL and affiliate's subdomain
        const { data: offer } = await supabase
          .from('offers')
          .select('links')
          .eq('id', offerId)
          .single();

        const { data: profile } = await supabase
          .from('profiles')
          .select('subdomain')
          .eq('id', affiliateId)
          .single();

        if (!offer?.links?.[0]) {
          console.error('No destination URL found');
          return;
        }

        // Construct URL with subdomain if available
        const baseUrl = offer.links[0];
        let destinationUrl = baseUrl;

        if (profile?.subdomain) {
          try {
            const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
            const domainParts = url.hostname.split('.');
            const baseDomain = domainParts.length > 2 
              ? domainParts.slice(-2).join('.') 
              : url.hostname;
            
            destinationUrl = `${url.protocol}//${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
          } catch (error) {
            console.error('Error constructing subdomain URL:', error);
            destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          }
        } else {
          destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
        }

        // Perform the redirect
        window.location.href = destinationUrl;

      } catch (error) {
        console.error('Error in trackAndRedirect:', error);
      }
    };

    trackAndRedirect();
  }, [affiliateId, offerId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait while we process your request.</p>
      </div>
    </div>
  );
}