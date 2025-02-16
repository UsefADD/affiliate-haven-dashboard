
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

        // Get an active redirect domain
        const { data: domains } = await supabase
          .from('redirect_domains')
          .select('*')
          .eq('is_active', true)
          .order('last_used_at', { ascending: true })
          .limit(1)
          .single();

        if (!domains) {
          console.error('No active redirect domains available');
          return;
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

        // Record the click through Cloudflare Worker
        const redirectUrl = constructRedirectUrl(
          domains.domain,
          affiliateId,
          offerId,
          offer.links[0],
          profile?.subdomain
        );

        // Update last used timestamp for the domain
        await supabase
          .from('redirect_domains')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', domains.id);

        // Perform the redirect
        window.location.href = redirectUrl;

      } catch (error) {
        console.error('Error in trackAndRedirect:', error);
      }
    };

    trackAndRedirect();
  }, [affiliateId, offerId]);

  const constructRedirectUrl = (
    domain: string,
    affId: string,
    offId: string,
    finalUrl: string,
    subdomain?: string | null
  ) => {
    const url = new URL(`https://${domain}/r`);
    url.searchParams.set('a', affId);
    url.searchParams.set('o', offId);
    url.searchParams.set('d', btoa(finalUrl));
    if (subdomain) {
      url.searchParams.set('s', subdomain);
    }
    return url.toString();
  };

  // Return null instead of loading screen for instant redirect
  return null;
}
