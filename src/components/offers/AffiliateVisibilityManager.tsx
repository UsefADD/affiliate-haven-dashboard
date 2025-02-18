
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";
import { Skeleton } from "@/components/ui/skeleton";

interface Affiliate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_visible?: boolean;
}

interface AffiliateVisibilityManagerProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
}

export function AffiliateVisibilityManager({
  offer,
  isOpen,
  onClose,
}: AffiliateVisibilityManagerProps) {
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
      console.log('Fetching affiliates for offer:', offer.id);
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'affiliate');

      if (affiliatesError) throw affiliatesError;

      const { data: visibilityData, error: visibilityError } = await supabase
        .from('offer_visibility')
        .select('affiliate_id, is_visible')
        .eq('offer_id', offer.id);

      if (visibilityError) throw visibilityError;

      console.log('Visibility data:', visibilityData);

      // Create a map of visibility settings
      const visibilityMap = new Map(
        visibilityData?.map(v => [v.affiliate_id, v.is_visible])
      );

      const combinedData = affiliatesData?.map(affiliate => ({
        ...affiliate,
        is_visible: visibilityMap.has(affiliate.id) 
          ? visibilityMap.get(affiliate.id) 
          : true // Default to true if no explicit visibility setting
      })) || [];

      console.log('Combined affiliate data:', combinedData);
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

  const toggleVisibility = async (affiliateId: string, currentVisibility: boolean) => {
    try {
      console.log('Starting visibility toggle:', { 
        affiliateId, 
        currentVisibility, 
        offerId: offer.id 
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, check if there's an existing record
      const { data: existingRecord, error: checkError } = await supabase
        .from('offer_visibility')
        .select('*')
        .match({
          offer_id: offer.id,
          affiliate_id: affiliateId
        })
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (currentVisibility === false) {
        // We want to enable visibility (delete the record to revert to default true)
        if (existingRecord) {
          const { error: deleteError } = await supabase
            .from('offer_visibility')
            .delete()
            .match({
              offer_id: offer.id,
              affiliate_id: affiliateId
            });

          if (deleteError) throw deleteError;
        }
      } else {
        // We want to disable visibility (create/update record with is_visible = false)
        const { error: upsertError } = await supabase
          .from('offer_visibility')
          .upsert({
            offer_id: offer.id,
            affiliate_id: affiliateId,
            is_visible: false,
            created_by: user.id
          });

        if (upsertError) throw upsertError;
      }

      // Immediately update local state
      setAffiliates(prev =>
        prev.map(a =>
          a.id === affiliateId
            ? { ...a, is_visible: !currentVisibility }
            : a
        )
      );

      console.log('Visibility updated successfully:', {
        affiliateId,
        newVisibility: !currentVisibility
      });

      toast({
        title: "Success",
        description: `Updated visibility for ${getAffiliateDisplayName(affiliateId)}`,
      });

      // Refresh data to ensure we have the latest state
      await fetchAffiliates();
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
          <DialogTitle>Manage Offer Visibility for {offer.name}</DialogTitle>
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
