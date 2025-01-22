import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Replace these with your own Supabase project details
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// Add debug logging
console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  anonKeyLength: supabaseAnonKey.length,
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  }
});

// Test database connection
(async () => {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database access error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('Database connection successful. Sample data:', data);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();