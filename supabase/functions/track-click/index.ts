import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const redirectPage = (destinationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to Offer...</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    setTimeout(function() {
      window.location.href = "${destinationUrl}";
    }, 3000);
  </script>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(to right, #22c55e, #16a34a);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 20px auto;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .message {
      margin-top: 1rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Please wait...</h2>
    <div class="spinner"></div>
    <p>You are being redirected to the offer.</p>
    <p class="message">This will only take a few seconds.</p>
  </div>
</body>
</html>
`;

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    // Get the offer's destination URL
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('links')
      .eq('id', offerId)
      .maybeSingle();

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
      .maybeSingle();

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

    // Return HTML page with redirect
    return new Response(redirectPage(destinationUrl), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error processing click:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});