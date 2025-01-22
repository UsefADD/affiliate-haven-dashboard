import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ibjnokzepukzuzveseik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imliam5va3plcHVrenV6dmVzZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4OTU1NzcsImV4cCI6MjAyMTQ3MTU3N30.RkKDwS-5q2egF_vHEwr4HSEYh_Qe_lRmKi_tFI-IyPE';

console.log('Initializing Supabase client with:', {
  url: supabaseUrl ? 'URL exists' : 'URL missing',
  key: supabaseAnonKey ? 'Key exists' : 'Key missing',
  keyLength: supabaseAnonKey?.length
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
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connection successful, session:', data.session ? 'exists' : 'none');
  }
});

// Test a simple query to verify database access
supabase
  .from('profiles')
  .select('count')
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.error('Database access error:', error);
    } else {
      console.log('Database access successful');
    }
  });

console.log('Supabase client initialized successfully');