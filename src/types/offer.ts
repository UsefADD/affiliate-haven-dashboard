export interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  created_by: string;
  creatives?: {
    type: "image" | "email";
    content: string;
    details?: {
      fromNames?: string[];
      subjects?: string[];
    };
    images?: string[];
  }[];
  links?: string[];
  is_top_offer?: boolean;
  leads_count?: number;
  last_conversion_date?: string;
}