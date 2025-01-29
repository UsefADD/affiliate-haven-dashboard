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

        // Get IP address for duplicate click checking
        const ipAddress = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);

        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getTime() - 24);

        // Check for duplicate clicks
        const { data: existingClicks } = await supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .eq('offer_id', offerId)
          .eq('ip_address', ipAddress)
          .gte('clicked_at', twentyFourHoursAgo.toISOString());

        if (!existingClicks || existingClicks.length === 0) {
          console.log("Recording new click for:", { affiliateId, offerId });
          
          // Record the click
          const { error: clickError } = await supabase
            .from('affiliate_clicks')
            .insert({
              affiliate_id: affiliateId,
              offer_id: offerId,
              ip_address: ipAddress,
              referrer: document.referrer,
              user_agent: navigator.userAgent
            });

          if (clickError) {
            console.error('Error recording click:', clickError);
          }
        } else {
          console.log("Duplicate click detected, redirecting without counting");
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

        console.log("Offer data:", offer);
        console.log("Profile data:", profile);

        if (!offer?.links?.[0]) {
          console.error('No destination URL found for offer');
          navigate("/");
          return;
        }

        // Construct URL with subdomain if available
        const baseUrl = offer.links[0];
        let destinationUrl = baseUrl;

        if (profile?.subdomain) {
          try {
            // Handle URLs with or without protocol
            const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
            
            // Extract domain parts
            const domainParts = url.hostname.split('.');
            const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : url.hostname;
            
            // Construct final URL with subdomain
            destinationUrl = `${url.protocol}//${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
            console.log("Redirecting to URL with subdomain:", destinationUrl);
          } catch (error) {
            console.error('Error constructing subdomain URL:', error);
            destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          }
        } else {
          destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
        }

        // Perform the actual redirect
        window.location.replace(destinationUrl);

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