
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";
import { Skeleton } from "@/components/ui/skeleton";

interface Affiliate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  custom_payout?: number | null;
}

interface AffiliatePayoutManagerProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
}

interface PayoutData {
  affiliate_id: string;
  custom_payout: number;
}

export function AffiliatePayoutManager({
  offer,
  isOpen,
  onClose,
}: AffiliatePayoutManagerProps) {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAffiliates();
    }
  }, [isOpen, offer.id]);

  const fetchAffiliates = async () => {
    try {
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'affiliate');

      if (affiliatesError) throw affiliatesError;

      const { data: payoutData, error: payoutError } = await supabase
        .rpc('get_affiliate_payouts', { 
          p_offer_id: offer.id 
        });

      if (payoutError) throw payoutError;

      // Create a map of affiliate IDs to their custom payouts
      const payoutMap = new Map(
        (payoutData as PayoutData[] || []).map(p => [p.affiliate_id, p.custom_payout])
      );

      // Combine affiliate data with their custom payouts
      const combinedData: Affiliate[] = (affiliatesData || []).map(affiliate => ({
        ...affiliate,
        custom_payout: payoutMap.get(affiliate.id) || null
      }));

      setAffiliates(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliates",
        variant: "destructive",
      });
    }
  };

  const updatePayout = async (affiliateId: string, payout: number | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use RPC call for managing payouts
      const { error } = await supabase
        .rpc('manage_affiliate_payout', { 
          p_offer_id: offer.id,
          p_affiliate_id: affiliateId,
          p_custom_payout: payout,
          p_created_by: user.id
        });

      if (error) throw error;

      setAffiliates(prev =>
        prev.map(a =>
          a.id === affiliateId
            ? { ...a, custom_payout: payout }
            : a
        )
      );

      toast({
        title: "Success",
        description: "Updated payout successfully",
      });
    } catch (error) {
      console.error('Error updating payout:', error);
      toast({
        title: "Error",
        description: "Failed to update payout",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Affiliate Payouts for {offer.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-[50vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : affiliates.length === 0 ? (
            <p className="text-center text-muted-foreground">No affiliates found</p>
          ) : (
            <div className="space-y-4">
              {affiliates.map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {affiliate.first_name && affiliate.last_name
                        ? `${affiliate.first_name} ${affiliate.last_name}`
                        : "Unnamed Affiliate"}
                    </p>
                    <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={`Default: $${offer.payout}`}
                      value={affiliate.custom_payout || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        updatePayout(affiliate.id, value);
                      }}
                      className="w-32"
                    />
                    {affiliate.custom_payout && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePayout(affiliate.id, null)}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
