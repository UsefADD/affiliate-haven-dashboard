import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateUserPayload {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  company?: string;
  role: 'admin' | 'affiliate';
  subdomain?: string;
  mode?: 'create' | 'edit';
  userId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the request is from an admin
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new Error('Only admins can manage users')
    }

    // Get the user data from the request
    const payload: CreateUserPayload = await req.json()
    console.log('Received payload:', payload)

    if (payload.mode === 'edit' && payload.userId) {
      console.log('Updating existing user:', payload.userId)
      
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name,
          company: payload.company,
          role: payload.role,
          subdomain: payload.subdomain,
        })
        .eq('id', payload.userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        throw new Error('Failed to update user profile')
      }

      // Update password if provided
      if (payload.password && payload.password.trim() !== '') {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          payload.userId,
          { password: payload.password }
        )

        if (passwordError) {
          console.error('Error updating password:', passwordError)
          throw new Error('Failed to update password')
        }
      }

      return new Response(
        JSON.stringify({ message: 'User updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (payload.mode === 'create' || !payload.mode) {
      console.log('Creating new user')
      
      // Create the user in auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
          first_name: payload.first_name,
          last_name: payload.last_name,
          company: payload.company,
        }
      });

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      if (newUser?.user) {
        // Update the user's profile
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
          console.error('Error updating profile:', profileError)
          // Clean up the created user if profile update fails
          await supabase.auth.admin.deleteUser(newUser.user.id)
          throw new Error('Failed to create user profile')
        }
      }

      return new Response(
        JSON.stringify({ message: 'User created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error('Invalid mode specified')
    }
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
