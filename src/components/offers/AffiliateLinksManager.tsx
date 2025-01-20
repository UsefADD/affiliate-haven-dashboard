import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AffiliateLink {
  id: string;
  affiliate_id: string;
  tracking_url: string;
}

interface AffiliateLinksManagerProps {
  offerId: string;
}

export function AffiliateLinksManager({ offerId }: AffiliateLinksManagerProps) {
  const [affiliates, setAffiliates] = useState<Profile[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [existingLinks, setExistingLinks] = useState<AffiliateLink[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
    fetchExistingLinks();
  }, [offerId]);

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

  const fetchExistingLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('id, affiliate_id, tracking_url')
        .eq('offer_id', offerId);

      if (error) throw error;
      setExistingLinks(data || []);
    } catch (error) {
      console.error('Error fetching existing links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing links",
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
      
      setSelectedAffiliate("");
      setTrackingUrl("");
      fetchExistingLinks();
    } catch (error) {
      console.error('Error adding affiliate link:', error);
      toast({
        title: "Error",
        description: "Failed to add affiliate link",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLink = async (linkId: string, newUrl: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .update({ tracking_url: newUrl })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tracking URL updated successfully",
      });
      
      fetchExistingLinks();
    } catch (error) {
      console.error('Error updating tracking URL:', error);
      toast({
        title: "Error",
        description: "Failed to update tracking URL",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate link deleted successfully",
      });
      
      fetchExistingLinks();
    } catch (error) {
      console.error('Error deleting affiliate link:', error);
      toast({
        title: "Error",
        description: "Failed to delete affiliate link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Tracking URLs</h3>
        {existingLinks.map((link) => {
          const affiliate = affiliates.find(a => a.id === link.affiliate_id);
          return (
            <Card key={link.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {affiliate?.first_name} {affiliate?.last_name}
                    </span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={link.tracking_url}
                      onBlur={(e) => {
                        if (e.target.value !== link.tracking_url) {
                          handleUpdateLink(link.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}