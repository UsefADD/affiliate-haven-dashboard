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
          bank_account_number: string | null
          bank_address: string | null
          bank_name: string | null
          bank_swift: string | null
          city: string
          company: string | null
          country: string
          created_at: string
          crypto_currency: string | null
          crypto_wallet: string | null
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
          paypal_email: string | null
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
          bank_account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          city: string
          company?: string | null
          country: string
          created_at?: string
          crypto_currency?: string | null
          crypto_wallet?: string | null
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
          paypal_email?: string | null
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
          bank_account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          crypto_currency?: string | null
          crypto_wallet?: string | null
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
          paypal_email?: string | null
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
          sub_id: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          offer_id?: string | null
          referrer?: string | null
          sub_id?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          offer_id?: string | null
          referrer?: string | null
          sub_id?: string | null
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
          variable_payout: boolean | null
        }
        Insert: {
          affiliate_id: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          offer_id: string
          payout: number
          status: string
          variable_payout?: boolean | null
        }
        Update: {
          affiliate_id?: string
          conversion_date?: string | null
          created_at?: string
          id?: string
          offer_id?: string
          payout?: number
          status?: string
          variable_payout?: boolean | null
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
      offer_payouts: {
        Row: {
          affiliate_id: string
          created_at: string
          created_by: string | null
          custom_payout: number
          id: string
          offer_id: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          created_by?: string | null
          custom_payout: number
          id?: string
          offer_id: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          created_by?: string | null
          custom_payout?: number
          id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_payouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_payouts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_visibility: {
        Row: {
          affiliate_id: string
          created_at: string
          created_by: string | null
          id: string
          is_visible: boolean
          offer_id: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean
          offer_id: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_visibility_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_visibility_offer_id_fkey"
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
          team_lead_id: string | null
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
          team_lead_id?: string | null
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
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_affiliate_payouts: {
        Args: { p_offer_id: string }
        Returns: {
          affiliate_id: string
          custom_payout: number
        }[]
      }
      get_lead_payout: {
        Args: { p_offer_id: string; p_affiliate_id: string }
        Returns: number
      }
      is_offer_visible_to_affiliate: {
        Args: { offer_id: string; affiliate_id: string }
        Returns: boolean
      }
      manage_affiliate_payout: {
        Args: {
          p_offer_id: string
          p_affiliate_id: string
          p_custom_payout: number
          p_created_by: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "affiliate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "affiliate"],
    },
  },
} as const
