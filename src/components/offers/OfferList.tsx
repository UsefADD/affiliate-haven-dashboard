import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateLink {
  id: string;
  tracking_url: string;
  affiliate_id: string;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
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
  affiliate_links?: AffiliateLink[];
}

interface OfferListProps {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onToggleStatus: (offerId: string, currentStatus: boolean) => void;
  isAdmin?: boolean;
}

export function OfferList({ offers, onEdit, onToggleStatus, isAdmin = false }: OfferListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const getAffiliateLink = (offer: Offer) => {
    if (!currentUserId || !offer.affiliate_links) return null;
    return offer.affiliate_links.find(link => link.affiliate_id === currentUserId)?.tracking_url;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payout</TableHead>
            {!isAdmin && <TableHead>Your Tracking Link</TableHead>}
            <TableHead>Creatives</TableHead>
            {isAdmin && <TableHead>Status</TableHead>}
            <TableHead>Created At</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell className="font-medium">
                {offer.creatives?.some(c => c.type === "image") && (
                  <div className="w-20 mb-2">
                    <AspectRatio ratio={16/9}>
                      <img
                        src={offer.creatives.find(c => c.type === "image")?.content}
                        alt={offer.name}
                        className="rounded-md object-cover"
                      />
                    </AspectRatio>
                  </div>
                )}
                {offer.name}
              </TableCell>
              <TableCell>{offer.description || 'N/A'}</TableCell>
              <TableCell>${offer.payout}</TableCell>
              {!isAdmin && (
                <TableCell>
                  {getAffiliateLink(offer) || 'No tracking link assigned'}
                </TableCell>
              )}
              <TableCell>{offer.creatives?.length || 0} creatives</TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(offer.id, offer.status)}
                  >
                    {offer.status ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </TableCell>
              )}
              <TableCell>
                {new Date(offer.created_at).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(offer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
