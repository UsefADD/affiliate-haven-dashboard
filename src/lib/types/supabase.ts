
import type { Database } from '@/integrations/supabase/types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper types for redirect domains - use Supabase's generated types
export type RedirectDomain = Tables<'redirect_domains'>;
export type InsertRedirectDomain = InsertTables<'redirect_domains'>;
export type UpdateRedirectDomain = UpdateTables<'redirect_domains'>;
