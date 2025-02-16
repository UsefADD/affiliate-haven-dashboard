import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { RedirectDomain } from "@/lib/types/supabase";

export function RedirectPage() {
  const { affiliateId, offerId } = useParams();

  useEffect(() => {
    const trackAndRedirect = async () => {
      try {
        if (!affiliateId || !offerId) {
          console.error("Missing parameters:", { affiliateId, offerId });
          return;
        }

        console.log("Recording click for:", { affiliateId, offerId });

        // Get an active redirect domain
        const { data: redirectDomain, error: domainError } = await supabase
          .from('redirect_domains')
          .select('*')
          .eq('is_active', true)
          .order('last_used_at', { ascending: true })
          .limit(1)
          .single();

        if (domainError) {
          console.error("Error fetching redirect domain:", domainError);
          return;
        }

        // Call the Edge Function to record the click
        const { data, error } = await supabase.functions.invoke('track-click', {
          body: {
            affiliateId,
            offerId,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            redirectDomainId: redirectDomain?.id
          }
        });

        if (error) {
          console.error("Error recording click:", error);
        } else {
          console.log("Click recorded successfully:", data);
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

        if (profile?.subdomain && redirectDomain?.append_subdomain) {
          try {
            const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
            const domainParts = url.hostname.split('.');
            const baseDomain = domainParts.length > 2 
              ? domainParts.slice(-2).join('.') 
              : url.hostname;
            
            // If we have a redirect domain and it's set to append subdomains, use it
            if (redirectDomain) {
              destinationUrl = `${url.protocol}//${profile.subdomain}.${redirectDomain.domain}${url.pathname}${url.search}`;
            } else {
              destinationUrl = `${url.protocol}//${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
            }
          } catch (error) {
            console.error('Error constructing subdomain URL:', error);
            destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          }
        } else {
          // If no subdomain or append_subdomain is false, use the redirect domain as is
          if (redirectDomain) {
            const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
            destinationUrl = `${url.protocol}//${redirectDomain.domain}${url.pathname}${url.search}`;
          } else {
            destinationUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          }
        }

        // Update the last_used_at timestamp for the redirect domain
        if (redirectDomain) {
          await supabase
            .from('redirect_domains')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', redirectDomain.id);
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
