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
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchCampaignDetails();
      generateTrackingUrl();
    }
  }, [isOpen, campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      console.log("Fetching campaign details for ID:", campaignId);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      console.log("Fetched campaign details:", data);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  };

  const generateTrackingUrl = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Generating tracking URL for campaign:", campaignId);
      const newTrackingUrl = `${window.location.origin}/track/${campaignId}/${user.id}?target=${encodeURIComponent(campaign?.links?.[0] || '')}`;
      
      // Store the tracking URL in the database
      const { error: linkError } = await supabase
        .from('affiliate_links')
        .upsert({
          offer_id: campaignId,
          affiliate_id: user.id,
          tracking_url: newTrackingUrl
        }, {
          onConflict: 'offer_id,affiliate_id'
        });

      if (linkError) {
        console.error("Error storing tracking URL:", linkError);
        throw linkError;
      }

      console.log("Generated tracking URL:", newTrackingUrl);
      setTrackingUrl(newTrackingUrl);
    } catch (error) {
      console.error('Error generating tracking URL:', error);
    }
  };

  const handleCopyToClipboard = async () => {
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
            <h3 className="text-lg font-semibold mb-2">Your Tracking URL</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted rounded-md">
                <code className="text-sm">{trackingUrl}</code>
              </div>
              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              {trackingUrl && (
                <Button variant="outline" asChild>
                  <a 
                    href={trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {campaign.creatives?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Email Marketing Assets</h3>
              {campaign.creatives.map((creative: any, index: number) => (
                <div key={index} className="space-y-4">
                  {creative.details?.fromNames && (
                    <div>
                      <h4 className="font-medium mb-2">Available "From" Names:</h4>
                      <ul className="list-disc pl-5">
                        {creative.details.fromNames.map((name: string, idx: number) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {creative.details?.subjects && (
                    <div>
                      <h4 className="font-medium mb-2">Available Subject Lines:</h4>
                      <ul className="list-disc pl-5">
                        {creative.details.subjects.map((subject: string, idx: number) => (
                          <li key={idx}>{subject}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {creative.images && creative.images.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Creative Images:</h4>
                      <div className="grid gap-4 grid-cols-2">
                        {creative.images.map((image: string, idx: number) => (
                          <img 
                            key={idx}
                            src={image}
                            alt={`Creative ${idx + 1}`}
                            className="rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}