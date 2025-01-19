export interface Campaign {
  id: number;
  name: string;
  payout: string;
  availability: "Approved" | "Pending" | "Rejected";
  links?: string[];
  creatives?: string[];
}