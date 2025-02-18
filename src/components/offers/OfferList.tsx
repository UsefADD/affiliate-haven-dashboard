
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Eye, Pencil, Star, Trash2, DollarSign, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";
import { AffiliateVisibilityManager } from "./AffiliateVisibilityManager";
import { AffiliatePayoutManager } from "./AffiliatePayoutManager";
import { format } from "date-fns";

interface OfferListProps {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
  onToggleStatus: (offerId: string, currentStatus: boolean) => void;
  onToggleTopOffer?: (offerId: string, currentTopStatus: boolean) => void;
  isAdmin?: boolean;
}

export function OfferList({ 
  offers: initialOffers, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onToggleTopOffer, 
  isAdmin = false 
}: OfferListProps) {
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offers, setOffers] = useState<(Offer & { custom_payout?: number | null })[]>(initialOffers);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) {
      fetchCustomPayouts();
    }
  }, [isAdmin]);

  const fetchCustomPayouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const offersWithPayouts = await Promise.all(
        initialOffers.map(async (offer) => {
          const { data: payoutData, error: payoutError } = await supabase
            .rpc('get_affiliate_payouts', { 
              p_offer_id: offer.id 
            });

          if (payoutError) throw payoutError;

          const affiliatePayout = payoutData?.find((p: any) => p.affiliate_id === user.id);
          
          return {
            ...offer,
            custom_payout: affiliatePayout?.custom_payout || null
          };
        })
      );

      console.log('Offers with custom payouts:', offersWithPayouts);
      setOffers(offersWithPayouts);
    } catch (error) {
      console.error('Error fetching custom payouts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom payouts",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityDialog = (offer: Offer) => {
    setSelectedOffer(offer);
    setVisibilityDialogOpen(true);
  };

  const handlePayoutDialog = (offer: Offer) => {
    setSelectedOffer(offer);
    setPayoutDialogOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Status</TableHead>
            {isAdmin && <TableHead>Top Offer</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell className="font-medium">{offer.name}</TableCell>
              <TableCell>{offer.description}</TableCell>
              <TableCell>
                ${offer.custom_payout || offer.payout}
                {offer.custom_payout && !isAdmin && (
                  <span className="ml-2 text-xs text-muted-foreground">(Custom)</span>
                )}
              </TableCell>
              <TableCell>{format(new Date(offer.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                {isAdmin ? (
                  <Button
                    variant="ghost"
                    onClick={() => onToggleStatus(offer.id, offer.status)}
                    className={offer.status ? "text-green-600" : "text-red-600"}
                  >
                    {offer.status ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    offer.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {offer.status ? "Active" : "Inactive"}
                  </span>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => onToggleTopOffer?.(offer.id, offer.is_top_offer || false)}
                    className={offer.is_top_offer ? "text-yellow-600" : "text-gray-400"}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
              <TableCell className="text-right">
                {isAdmin ? (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePayoutDialog(offer)}
                      title="Manage affiliate payouts"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVisibilityDialog(offer)}
                      title="Manage visibility"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(offer)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    {/* Add any non-admin actions here */}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOffer && (
        <>
          <AffiliateVisibilityManager
            offer={selectedOffer}
            isOpen={visibilityDialogOpen}
            onClose={() => {
              setVisibilityDialogOpen(false);
              setSelectedOffer(null);
            }}
          />
          <AffiliatePayoutManager
            offer={selectedOffer}
            isOpen={payoutDialogOpen}
            onClose={() => {
              setPayoutDialogOpen(false);
              setSelectedOffer(null);
            }}
          />
        </>
      )}
    </div>
  );
}
