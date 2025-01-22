export interface Campaign {
  id: string;
  name: string;
  payout: number;
  status: boolean;
  description?: string | null;
  created_at: string;
  created_by: string;
  links?: string[];
  creatives?: {
    type: "image" | "email";
    content: string;
    details?: {
      fromNames?: string[];
      subjects?: string[];
    };
    images?: string[];
  }[];
}