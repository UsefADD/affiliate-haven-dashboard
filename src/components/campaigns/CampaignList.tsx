import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Offer } from "@/types/offer";

interface CampaignListProps {
  campaigns: Offer[];
  onViewDetails: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onViewDetails }: CampaignListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.id}</TableCell>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>${campaign.payout}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Active
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(campaign as unknown as Campaign)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}