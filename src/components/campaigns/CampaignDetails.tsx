import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CampaignDetailsProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignDetails({ campaignId, isOpen, onClose }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchCampaignDetails();
      fetchUserProfile();
    }
  }, [isOpen, campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getTrackingUrl = () => {
    if (!profile?.subdomain || !campaign?.id) {
      console.log("Missing subdomain or campaign ID");
      return '';
    }

    const baseUrl = `https://${profile.subdomain}.trackoffers.net`;
    const trackingPath = `/track/${campaign.id}/${profile.id}`;
    return `${baseUrl}${trackingPath}`;
  };

  const handleCopyToClipboard = async () => {
    const trackingUrl = getTrackingUrl();
    if (!trackingUrl) return;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast({
        title: "Success",
        description: "Tracking URL copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  if (!campaign) return null;

  const formattedTrackingUrl = getTrackingUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{campaign.name}</DialogTitle>
            {campaign.is_top_offer && (
              <Badge variant="secondary">Top Offer</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Payout</h3>
            <p className="text-xl font-bold">${campaign.payout}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Tracking URL</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted rounded-md">
                <code className="text-sm">{formattedTrackingUrl}</code>
              </div>
              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline">
                <a 
                  href={formattedTrackingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}