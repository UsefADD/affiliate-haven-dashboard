
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";

interface AffiliateVisibilityDialogProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
}

interface Affiliate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_visible?: boolean;
}

export function AffiliateVisibilityDialog({
  offer,
  isOpen,
  onClose,
}: AffiliateVisibilityDialogProps) {
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
      // Fetch all affiliates
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'affiliate');

      if (affiliatesError) throw affiliatesError;

      // Fetch visibility settings for this offer
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('offer_visibility')
        .select('affiliate_id, is_visible')
        .eq('offer_id', offer.id);

      if (visibilityError) throw visibilityError;

      // Combine the data
      const visibilityMap = new Map(
        visibilityData?.map(v => [v.affiliate_id, v.is_visible])
      );

      const combinedData = affiliatesData?.map(affiliate => ({
        ...affiliate,
        is_visible: visibilityMap.has(affiliate.id) 
          ? visibilityMap.get(affiliate.id) 
          : true
      }));

      setAffiliates(combinedData || []);
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

  const toggleVisibility = async (affiliateId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('offer_visibility')
        .upsert({
          offer_id: offer.id,
          affiliate_id: affiliateId,
          is_visible: !currentVisibility,
        }, {
          onConflict: 'offer_id,affiliate_id'
        });

      if (error) throw error;

      setAffiliates(prev =>
        prev.map(a =>
          a.id === affiliateId
            ? { ...a, is_visible: !currentVisibility }
            : a
        )
      );

      toast({
        title: "Success",
        description: `Offer visibility updated for ${getAffiliateDisplayName(affiliateId)}`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const getAffiliateDisplayName = (affiliateId: string) => {
    const affiliate = affiliates.find(a => a.id === affiliateId);
    if (!affiliate) return "Unknown Affiliate";
    return affiliate.first_name && affiliate.last_name
      ? `${affiliate.first_name} ${affiliate.last_name}`
      : affiliate.email || "Unknown Affiliate";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Offer Visibility</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-[50vh]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading affiliates...</p>
            ) : affiliates.length === 0 ? (
              <p className="text-center text-muted-foreground">No affiliates found</p>
            ) : (
              affiliates.map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {affiliate.first_name && affiliate.last_name
                        ? `${affiliate.first_name} ${affiliate.last_name}`
                        : "Unnamed Affiliate"}
                    </p>
                    <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                  </div>
                  <Switch
                    checked={affiliate.is_visible}
                    onCheckedChange={() => toggleVisibility(affiliate.id, affiliate.is_visible || true)}
                  />
                </div>
              ))
            )}
          </div>
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
