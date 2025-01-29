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

        // Get IP address for tracking purposes only
        const ipAddress = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);

        // Clean the IP address - take only the first IP if multiple are present
        const cleanIpAddress = ipAddress.split(',')[0].trim();
        console.log("Recording click from IP:", cleanIpAddress);

        // Record every click without duplicate checking
        await supabase
          .from('affiliate_clicks')
          .insert({
            affiliate_id: affiliateId,
            offer_id: offerId,
            ip_address: cleanIpAddress,
            referrer: document.referrer,
            user_agent: navigator.userAgent
          });

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

  // Return null instead of loading screen for instant redirect
  return null;
}