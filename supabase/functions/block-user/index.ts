import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the request body
    const { userId } = await req.json()
    console.log('Attempting to block user:', userId)

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Update the user's is_blocked status
    const { data, error } = await supabaseClient
      .from('profiles')
      .update({ is_blocked: true })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error blocking user:', error)
      throw error
    }

    console.log('Successfully blocked user:', data)

    return new Response(
      JSON.stringify({ message: 'User blocked successfully', user: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in block-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})