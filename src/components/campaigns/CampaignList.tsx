import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Offer } from "@/types/offer";
import { format } from "date-fns";

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
            <TableHead>Campaign Name</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Total Leads</TableHead>
            <TableHead>Last Conversion</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>${campaign.payout}</TableCell>
              <TableCell>
                {campaign.leads_count || 0} leads
              </TableCell>
              <TableCell>
                {campaign.last_conversion_date ? (
                  format(new Date(campaign.last_conversion_date), "MMM d, yyyy HH:mm:ss")
                ) : (
                  "No conversions yet"
                )}
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