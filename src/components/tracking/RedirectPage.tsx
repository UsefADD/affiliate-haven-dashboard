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

        // Clean the IP address - take only the first IP if multiple are present
        const cleanIpAddress = ipAddress.split(',')[0].trim();
        console.log("Clean IP address for click:", cleanIpAddress);

        // Check for duplicate clicks from same IP within 24 hours
        const { data: existingClicks } = await supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .eq('offer_id', offerId)
          .eq('ip_address', cleanIpAddress)
          .gte('clicked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Record click if no duplicate from same IP in last 24 hours
        if (!existingClicks || existingClicks.length === 0) {
          console.log("Recording new click...");
          await supabase
            .from('affiliate_clicks')
            .insert({
              affiliate_id: affiliateId,
              offer_id: offerId,
              ip_address: cleanIpAddress,
              referrer: document.referrer,
              user_agent: navigator.userAgent
            });
        } else {
          console.log("Duplicate click detected from IP:", cleanIpAddress);
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

  // Return null instead of loading screen for instant redirect
  return null;
}