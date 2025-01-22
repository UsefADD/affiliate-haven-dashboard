import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ibjnokzepukzuzveseik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imliam5va3plcHVrenV6dmVzZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5MzQyNDIsImV4cCI6MjAyMTUxMDI0Mn0.1gS1LM8qZXlcXvxbFUXDqQCHfLYOIBpkH1lpPVVAJQc';

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
    flowType: 'pkce'
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