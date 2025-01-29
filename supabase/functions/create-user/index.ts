import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  subdomain: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if the requesting user is an admin
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: requestingUser } } = await supabase.auth.getUser(authHeader)
    if (!requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user data from the request
    const payload: CreateUserPayload = await req.json()
    
    // Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    })

    if (createError) {
      throw createError
    }

    // Update the profile
    if (newUser.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name,
          company: payload.company,
          role: payload.role,
          email: payload.email,
          subdomain: payload.subdomain,
        })
        .eq('id', newUser.user.id)

      if (profileError) {
        throw profileError
      }
    }

    return new Response(
      JSON.stringify({ user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})