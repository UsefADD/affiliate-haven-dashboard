import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateLinksManager } from "./AffiliateLinksManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user?.id) {
        fetchAffiliateLinks(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchAffiliateLinks = async (userId: string) => {
    try {
      console.log("Fetching affiliate links for user:", userId);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('offer_id, tracking_url')
        .eq('affiliate_id', userId);

      if (error) throw error;

      console.log("Fetched affiliate links:", data);
      
      // Create a map of offer_id to tracking_url
      const linksMap = data?.reduce((acc, link) => ({
        ...acc,
        [link.offer_id]: link.tracking_url
      }), {});

      setAffiliateLinks(linksMap || {});
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!currentUserId) return null;
    return affiliateLinks[offer.id] || (offer.links && offer.links[0]) || null;
  };

  return (
    <div className="space-y-6">
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
                    {getTrackingUrl(offer) || 'No tracking link assigned'}
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
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOfferId(offer.id)}
                        >
                          Manage Links
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Tracking URLs for {offer.name}</DialogTitle>
                        </DialogHeader>
                        <AffiliateLinksManager offerId={offer.id} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}