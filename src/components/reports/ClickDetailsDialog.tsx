import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Info } from "lucide-react";

interface ClickDetailsProps {
  clicks: {
    id: string;
    clicked_at: string;
    ip_address: string | null;
    user_agent: string | null;
    referrer: string | null;
    sub_id: string | null;
    offers: {
      name: string;
      payout: number;
    } | null;
  }[];
  campaignName: string;
}

export function ClickDetailsDialog({ clicks, campaignName }: ClickDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center text-primary hover:underline">
        {clicks.length} <Info className="h-4 w-4 ml-1" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Click Details for {campaignName}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Sub ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clicks.map((click) => (
              <TableRow key={click.id}>
                <TableCell>{format(new Date(click.clicked_at), 'PPp')}</TableCell>
                <TableCell>{click.ip_address || 'N/A'}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={click.user_agent || ''}>
                  {click.user_agent || 'N/A'}
                </TableCell>
                <TableCell>{click.referrer || 'Direct'}</TableCell>
                <TableCell>{click.sub_id || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}