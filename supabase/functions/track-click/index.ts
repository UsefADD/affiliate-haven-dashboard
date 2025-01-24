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

    // Extract offer ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const offerId = pathParts[pathParts.length - 1];

    if (!offerId) {
      return new Response(
        JSON.stringify({ error: 'Missing offer ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing click for offer ${offerId}`);

    // Get the destination URL
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('links')
      .eq('id', offerId)
      .single();

    if (offerError) throw offerError;

    if (!offer?.links?.[0]) {
      throw new Error('No destination URL available');
    }

    const destinationUrl = offer.links[0].startsWith('http') ? 
      offer.links[0] : 
      `https://${offer.links[0]}`;

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