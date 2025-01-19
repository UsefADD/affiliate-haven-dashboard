export interface Campaign {
  id: number;
  name: string;
  payout: string;
  availability: "Approved" | "Pending" | "Rejected";
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