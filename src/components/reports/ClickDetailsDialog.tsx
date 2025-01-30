import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

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

// Helper function to parse user agent string
const getBrowserInfo = (userAgent: string | null): string => {
  if (!userAgent) return 'N/A';
  
  // Common browser patterns
  const browsers = [
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Safari\/([0-9.]+)/ },
    { name: 'Opera', pattern: /OPR\/([0-9.]+)/ },
    { name: 'Edge', pattern: /Edg\/([0-9.]+)/ }
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.pattern);
    if (match) {
      return `${browser.name} ${match[1]}`;
    }
  }

  return 'Unknown Browser';
};

// Helper function to get first IP address
const getFirstIpAddress = (ipString: string | null): string => {
  if (!ipString) return 'N/A';
  return ipString.split(',')[0].trim();
};

export function ClickDetailsDialog({ clicks, campaignName }: ClickDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger className="text-primary hover:underline">
        {clicks.length}
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
                <TableCell>{getFirstIpAddress(click.ip_address)}</TableCell>
                <TableCell>{getBrowserInfo(click.user_agent)}</TableCell>
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