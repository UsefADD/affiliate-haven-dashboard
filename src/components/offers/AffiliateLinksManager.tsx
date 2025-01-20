import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AffiliateLinksManagerProps {
  offerId: string;
}

export function AffiliateLinksManager({ offerId }: AffiliateLinksManagerProps) {
  const [affiliates, setAffiliates] = useState<Profile[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchAffiliates = async () => {
    try {
      console.log("Fetching affiliates...");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'affiliate');

      if (error) throw error;
      console.log("Fetched affiliates:", data);
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliates",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = async () => {
    if (!selectedAffiliate || !trackingUrl) {
      toast({
        title: "Error",
        description: "Please select an affiliate and enter a tracking URL",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding affiliate link:", {
        offer_id: offerId,
        affiliate_id: selectedAffiliate,
        tracking_url: trackingUrl,
      });

      const { error } = await supabase
        .from('affiliate_links')
        .insert({
          offer_id: offerId,
          affiliate_id: selectedAffiliate,
          tracking_url: trackingUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate link added successfully",
      });
      
      setIsOpen(false);
      setSelectedAffiliate("");
      setTrackingUrl("");
    } catch (error) {
      console.error('Error adding affiliate link:', error);
      toast({
        title: "Error",
        description: "Failed to add affiliate link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchAffiliates();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Manage Affiliate Links
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Affiliate Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Affiliate</label>
            <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
              <SelectTrigger>
                <SelectValue placeholder="Select an affiliate" />
              </SelectTrigger>
              <SelectContent>
                {affiliates.map((affiliate) => (
                  <SelectItem key={affiliate.id} value={affiliate.id}>
                    {affiliate.first_name} {affiliate.last_name} ({affiliate.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tracking URL</label>
            <Input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="Enter tracking URL"
            />
          </div>
          <Button onClick={handleAddLink} className="w-full">
            Add Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}