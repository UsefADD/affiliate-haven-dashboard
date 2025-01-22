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
    detectSessionInUrl: true
  }
});

// Test database access
(async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database access error:', error);
    } else {
      console.log('Database connection successful', data);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();