import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract affiliate and offer IDs from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const affiliateId = pathParts[pathParts.length - 2];
    const offerId = pathParts[pathParts.length - 1];

    if (!affiliateId || !offerId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Recording click for affiliate ${affiliateId} on offer ${offerId}`);

    // Record the click
    const { error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateId,
        offer_id: offerId,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer')
      });

    if (clickError) throw clickError;

    // Get the destination URL
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('links')
      .eq('id', offerId)
      .single();

    if (offerError) throw offerError;

    // Get affiliate-specific link if it exists
    const { data: affiliateLink, error: linkError } = await supabaseClient
      .from('affiliate_links')
      .select('tracking_url')
      .eq('offer_id', offerId)
      .eq('affiliate_id', affiliateId)
      .maybeSingle();

    if (linkError) throw linkError;

    // Get user's subdomain if available
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subdomain')
      .eq('id', affiliateId)
      .single();

    if (profileError) throw profileError;

    let destinationUrl;
    
    if (affiliateLink?.tracking_url) {
      destinationUrl = affiliateLink.tracking_url;
    } else if (profile?.subdomain && offer.links?.[0]) {
      const defaultLink = offer.links[0];
      const linkUrl = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
      const domainParts = linkUrl.hostname.split('.');
      const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : linkUrl.hostname;
      destinationUrl = `https://${profile.subdomain}.${baseDomain}${linkUrl.pathname}${linkUrl.search}`;
    } else if (offer.links?.[0]) {
      destinationUrl = offer.links[0].startsWith('http') ? offer.links[0] : `https://${offer.links[0]}`;
    } else {
      throw new Error('No destination URL available');
    }

    console.log('Redirecting to:', destinationUrl);

    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': destinationUrl
      }
    });
  } catch (error) {
    console.error('Error processing click:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})