
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Delete user function called')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the session from the request
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('Auth session missing!')
    }

    console.log('Checking user authorization')
    
    // Verify the user making the request is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )
    if (userError) throw userError

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()
    if (profileError) throw profileError

    if (profile.role !== 'admin') {
      throw new Error('Not authorized')
    }

    // Get the user ID to delete from the request
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Deleting user:', userId)

    // First check if the user exists and get their profile
    const { data: userToDelete, error: checkUserError } = await supabase.auth.admin.getUserById(userId)
    if (checkUserError) {
      console.error('Error checking user existence:', checkUserError)
      throw new Error('Error checking user existence')
    }
    
    if (!userToDelete) {
      throw new Error('User not found')
    }

    // Delete all related records from other tables first
    console.log('Deleting related records for user:', userId)
    
    // Delete affiliate clicks
    const { error: clicksError } = await supabase
      .from('affiliate_clicks')
      .delete()
      .eq('affiliate_id', userId)
    if (clicksError) {
      console.error('Error deleting affiliate clicks:', clicksError)
    }

    // Delete affiliate links
    const { error: linksError } = await supabase
      .from('affiliate_links')
      .delete()
      .eq('affiliate_id', userId)
    if (linksError) {
      console.error('Error deleting affiliate links:', linksError)
    }

    // Delete leads
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .eq('affiliate_id', userId)
    if (leadsError) {
      console.error('Error deleting leads:', leadsError)
    }

    // Finally delete the user from auth.users which will cascade delete their profile
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      throw new Error('Error deleting user')
    }

    console.log('User deleted successfully')

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in delete-user function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
