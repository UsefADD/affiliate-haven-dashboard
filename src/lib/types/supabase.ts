
import type { Database } from '@/integrations/supabase/types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper types for redirect domains
export type RedirectDomain = {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  last_used_at: string | null;
  append_subdomain: boolean;
  status: string;
  notes: string | null;
  cf_zone_id: string | null;
  cf_status: string | null;
  cf_health_score: number | null;
  cf_last_check: string | null;
};

export type InsertRedirectDomain = Omit<RedirectDomain, 'id' | 'created_at'>;
export type UpdateRedirectDomain = Partial<InsertRedirectDomain>;
