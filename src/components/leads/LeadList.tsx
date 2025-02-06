
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  affiliate_id: string;
  offer_id: string;
  status: string;
  created_at: string;
  conversion_date: string | null;
  payout: number;
  variable_payout: boolean;
  affiliate: {
    first_name: string | null;
    last_name: string | null;
  };
  offer: {
    name: string;
  };
}

interface LeadListProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onToggleStatus: (leadId: string, currentStatus: string) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadList({ leads, onEdit, onDelete }: LeadListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliate</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Conversion Date</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                {lead.affiliate.first_name} {lead.affiliate.last_name}
              </TableCell>
              <TableCell>{lead.offer.name}</TableCell>
              <TableCell>
                {format(new Date(lead.created_at), 'MMM d, yyyy HH:mm:ss')}
              </TableCell>
              <TableCell>
                {lead.conversion_date 
                  ? format(new Date(lead.conversion_date), 'MMM d, yyyy HH:mm:ss')
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {lead.variable_payout ? `$${lead.payout} (Variable)` : `$${lead.payout}`}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(lead)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(lead)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
