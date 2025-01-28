import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const { affiliateId, offerId, referrer, userAgent } = await req.json();

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
        user_agent: userAgent,
        referrer: referrer,
      });

    if (clickError) {
      console.error('Error recording click:', clickError);
      throw clickError;
    }

    console.log('Click recorded successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
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