import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  affiliate_id: string;
  offer_id: string;
  status: string;
  created_at: string;
  conversion_date: string | null;
  payout: number;
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

export function LeadList({ leads, onEdit, onToggleStatus, onDelete }: LeadListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliate</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Conversion Date</TableHead>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(lead.id, lead.status)}
                >
                  {lead.status === 'converted' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </TableCell>
              <TableCell>${lead.payout}</TableCell>
              <TableCell>
                {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {lead.conversion_date 
                  ? format(new Date(lead.conversion_date), 'MMM d, yyyy')
                  : 'N/A'}
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