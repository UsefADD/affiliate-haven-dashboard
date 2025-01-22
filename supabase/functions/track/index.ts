import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Extract tracking parameters from URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const offerId = pathParts[2]
    const affiliateId = pathParts[3]

    if (!offerId || !affiliateId) {
      throw new Error('Missing required tracking parameters')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    )

    console.log('Recording click for:', { offerId, affiliateId })

    // Record the click
    const { error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .insert({
        offer_id: offerId,
        affiliate_id: affiliateId,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer')
      })

    if (clickError) {
      console.error('Error recording click:', clickError)
      throw clickError
    }

    // Fetch the offer to get the destination URL
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('links')
      .eq('id', offerId)
      .single()

    if (offerError) {
      console.error('Error fetching offer:', offerError)
      throw offerError
    }

    // Get the first link from the offer's links array
    const destinationUrl = offer.links?.[0]

    if (!destinationUrl) {
      throw new Error('No destination URL found for offer')
    }

    console.log('Redirecting to:', destinationUrl)

    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': destinationUrl
      }
    })

  } catch (error) {
    console.error('Error in track function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})