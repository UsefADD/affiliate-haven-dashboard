import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ibjnokzepukzuzveseik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imliam5va3plcHVrenV6dmVzZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5MzQyNDIsImV4cCI6MjAyMTUxMDI0Mn0.1gS1LM8qZXlcXvxbFUXDqQCHfLYOIBpkH1lpPVVAJQc';

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  keyPreview: supabaseAnonKey?.substring(0, 10) + '...'
});

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

// Test the connection and auth configuration
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase auth error:', error);
  } else {
    console.log('Supabase auth successful:', {
      hasSession: !!data.session,
      user: data.session?.user?.email
    });
  }
});

// Test database access with a simple query
supabase
  .from('profiles')
  .select('*')
  .limit(1)
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Database access error:', error);
    } else {
      console.log('Database access successful, retrieved profile:', data);
    }
  });

console.log('Supabase client configuration complete');