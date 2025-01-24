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

    // Extract affiliate ID and offer ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const affiliateId = pathParts[pathParts.length - 2];
    const offerId = pathParts[pathParts.length - 1];

    console.log(`Processing click for affiliate ${affiliateId} and offer ${offerId}`);

    if (!affiliateId || !offerId) {
      throw new Error('Missing affiliate ID or offer ID');
    }

    // Record the click
    const { error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateId,
        offer_id: offerId,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer'),
      });

    if (clickError) {
      console.error('Error recording click:', clickError);
      throw clickError;
    }

    console.log('Click recorded successfully');

    // First check for specific affiliate link
    const { data: affiliateLink, error: linkError } = await supabaseClient
      .from('affiliate_links')
      .select('tracking_url')
      .eq('affiliate_id', affiliateId)
      .eq('offer_id', offerId)
      .maybeSingle();

    if (linkError) {
      console.error('Error fetching affiliate link:', linkError);
      throw linkError;
    }

    if (affiliateLink?.tracking_url) {
      console.log('Using affiliate-specific tracking URL:', affiliateLink.tracking_url);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': affiliateLink.tracking_url
        }
      });
    }

    // If no specific link, get the offer's default link
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('links')
      .eq('id', offerId)
      .single();

    if (offerError) {
      console.error('Error fetching offer:', offerError);
      throw offerError;
    }

    if (!offer?.links?.[0]) {
      throw new Error('No destination URL available');
    }

    // Get user's subdomain if available
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subdomain')
      .eq('id', affiliateId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    let destinationUrl = offer.links[0];

    // If user has subdomain, modify the URL
    if (profile?.subdomain) {
      try {
        const url = new URL(destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`);
        const domainParts = url.hostname.split('.');
        const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : url.hostname;
        destinationUrl = `https://${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
        console.log('Generated subdomain URL:', destinationUrl);
      } catch (error) {
        console.error('Error generating subdomain URL:', error);
        // Fallback to original URL if subdomain processing fails
        destinationUrl = offer.links[0];
      }
    }

    // Ensure URL has protocol
    if (!destinationUrl.startsWith('http')) {
      destinationUrl = `https://${destinationUrl}`;
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