
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

    const cloudflareToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    if (!cloudflareToken) {
      throw new Error('Cloudflare API token not configured');
    }

    // Fetch all active domains
    const { data: domains, error: domainsError } = await supabaseClient
      .from('redirect_domains')
      .select('*')
      .eq('is_active', true);

    if (domainsError) throw domainsError;

    // Check each domain's status with Cloudflare
    const domainUpdates = await Promise.all(domains.map(async (domain) => {
      try {
        if (!domain.cf_zone_id) {
          // Look up zone ID if not stored
          const zoneResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones?name=${domain.domain}`,
            {
              headers: {
                'Authorization': `Bearer ${cloudflareToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const zoneData = await zoneResponse.json();
          if (zoneData.result?.[0]?.id) {
            domain.cf_zone_id = zoneData.result[0].id;
          }
        }

        if (domain.cf_zone_id) {
          // Check domain health
          const healthResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${domain.cf_zone_id}/health`,
            {
              headers: {
                'Authorization': `Bearer ${cloudflareToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const healthData = await healthResponse.json();
          
          return {
            id: domain.id,
            cf_status: healthData.result?.status || 'unknown',
            cf_health_score: healthData.result?.score || 0,
            cf_last_check: new Date().toISOString(),
            is_active: healthData.result?.score > 50 // Deactivate domains with poor health
          };
        }

        return null;
      } catch (error) {
        console.error(`Error checking domain ${domain.domain}:`, error);
        return null;
      }
    }));

    // Update domain statuses in database
    const validUpdates = domainUpdates.filter(Boolean);
    if (validUpdates.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('redirect_domains')
        .upsert(validUpdates);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked: domains.length,
        updated: validUpdates.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error checking domains:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
