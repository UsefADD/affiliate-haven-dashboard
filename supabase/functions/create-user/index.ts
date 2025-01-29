import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreateUserPayload {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  company?: string;
  role: 'admin' | 'affiliate';
  subdomain?: string;
  mode: 'create' | 'edit';
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the request is from an admin
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new Error('Only admins can manage users');
    }

    // Get the user data from the request
    const payload: CreateUserPayload = await req.json();
    
    if (payload.mode === 'create') {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', payload.email)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'A user with this email address has already been registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
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
            subdomain: payload.subdomain,
            email: payload.email,
          })
          .eq('id', newUser.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }
      }

      return new Response(
        JSON.stringify({ message: 'User created successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (payload.mode === 'edit' && payload.userId) {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name,
          company: payload.company,
          role: payload.role,
          subdomain: payload.subdomain,
        })
        .eq('id', payload.userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Only update password if one is provided
      if (payload.password && payload.password.trim() !== '') {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          payload.userId,
          { password: payload.password }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          throw passwordError;
        }
      }

      return new Response(
        JSON.stringify({ message: 'User updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid mode specified');

  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});