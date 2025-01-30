export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_applications: {
        Row: {
          address: string
          apt_suite: string | null
          city: string
          company: string | null
          country: string
          created_at: string
          current_advertisers: string
          email: string
          first_name: string
          id: string
          im: string | null
          im_type: string | null
          known_contacts: string
          last_name: string
          marketing_comments: string | null
          pay_to: string
          payment_method: string
          phone: string
          site_marketing: string | null
          state: string
          status: string | null
          telegram: string
          title: string | null
          website_url: string | null
          zip_postal: string
        }
        Insert: {
          address: string
          apt_suite?: string | null
          city: string
          company?: string | null
          country: string
          created_at?: string
          current_advertisers: string
          email: string
          first_name: string
          id?: string
          im?: string | null
          im_type?: string | null
          known_contacts: string
          last_name: string
          marketing_comments?: string | null
          pay_to: string
          payment_method: string
          phone: string
          site_marketing?: string | null
          state: string
          status?: string | null
          telegram: string
          title?: string | null
          website_url?: string | null
          zip_postal: string
        }
        Update: {
          address?: string
          apt_suite?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          current_advertisers?: string
          email?: string
          first_name?: string
          id?: string
          im?: string | null
          im_type?: string | null
          known_contacts?: string
          last_name?: string
          marketing_comments?: string | null
          pay_to?: string
          payment_method?: string
          phone?: string
          site_marketing?: string | null
          state?: string
          status?: string | null
          telegram?: string
          title?: string | null
          website_url?: string | null
          zip_postal?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string | null
          clicked_at: string | null
          id: string
          ip_address: string | null
          offer_id: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          offer_id?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          offer_id?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string | null
          created_at: string
          id: string
          offer_id: string | null
          tracking_url: string
        }
        Insert: {
          affiliate_id?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          tracking_url: string
        }
        Update: {
          affiliate_id?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          tracking_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          affiliate_id: string
          conversion_date: string | null
          created_at: string
          id: string
          offer_id: string
          payout: number
          status: string
        }
        Insert: {
          affiliate_id: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          offer_id: string
          payout: number
          status: string
        }
        Update: {
          affiliate_id?: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          offer_id?: string
          payout?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          created_by: string
          creatives: Json | null
          description: string | null
          id: string
          is_top_offer: boolean | null
          links: string[] | null
          name: string
          payout: number
          status: boolean | null
        }
        Insert: {
          created_at?: string
          created_by: string
          creatives?: Json | null
          description?: string | null
          id?: string
          is_top_offer?: boolean | null
          links?: string[] | null
          name: string
          payout: number
          status?: boolean | null
        }
        Update: {
          created_at?: string
          created_by?: string
          creatives?: Json | null
          description?: string | null
          id?: string
          is_top_offer?: boolean | null
          links?: string[] | null
          name?: string
          payout?: number
          status?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_blocked: boolean | null
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subdomain: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_blocked?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subdomain?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subdomain?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "affiliate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
