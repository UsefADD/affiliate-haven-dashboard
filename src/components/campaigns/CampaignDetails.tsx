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
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchCampaignDetails();
      fetchAffiliateLink();
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

  const fetchAffiliateLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching affiliate link for campaign:", campaignId);
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('tracking_url')
        .eq('offer_id', campaignId)
        .eq('affiliate_id', user.id)
        .single();

      if (linkError) {
        if (linkError.code === 'PGRST116') {
          console.log("No existing affiliate link found");
          const { data: profileData } = await supabase
            .from('profiles')
            .select('subdomain')
            .eq('id', user.id)
            .single();

          if (profileData?.subdomain) {
            const generatedUrl = `https://${profileData.subdomain}.trackoffers.net/track/${campaignId}/${user.id}`;
            console.log("Generated tracking URL:", generatedUrl);
            setAffiliateLink(generatedUrl);
          }
        } else {
          throw linkError;
        }
      } else if (linkData) {
        console.log("Found existing affiliate link:", linkData.tracking_url);
        setAffiliateLink(linkData.tracking_url);
      }
    } catch (error) {
      console.error('Error fetching affiliate link:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!affiliateLink) return;

    try {
      await navigator.clipboard.writeText(affiliateLink);
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
                <code className="text-sm">{affiliateLink}</code>
              </div>
              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              {affiliateLink && (
                <Button variant="outline" asChild>
                  <a 
                    href={affiliateLink} 
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