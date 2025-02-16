
export interface RedirectDomain {
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
}

export type InsertRedirectDomain = Omit<RedirectDomain, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UpdateRedirectDomain = Partial<InsertRedirectDomain>;
