import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";

export function CampaignList({ campaigns, profile }: { campaigns: Offer[]; profile: any }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});

  const generateTrackingUrl = async (campaign: Offer) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log("Generating tracking URL for campaign:", campaign.id);
      const trackingUrl = `${window.location.origin}/track/${campaign.id}/${user.id}?target=${encodeURIComponent(campaign.links?.[0] || '')}`;
      console.log("Generated tracking URL:", trackingUrl);
      
      // Store the tracking URL in the database
      const { error: linkError } = await supabase
        .from('affiliate_links')
        .upsert({
          offer_id: campaign.id,
          affiliate_id: user.id,
          tracking_url: trackingUrl
        }, {
          onConflict: 'offer_id,affiliate_id'
        });

      if (linkError) {
        console.error("Error storing tracking URL:", linkError);
        throw linkError;
      }

      return trackingUrl;
    } catch (error) {
      console.error('Error generating tracking URL:', error);
      return null;
    }
  };

  const handleCopyToClipboard = async (campaign: Offer) => {
    try {
      let trackingUrl = affiliateLinks[campaign.id];
      
      if (!trackingUrl) {
        trackingUrl = await generateTrackingUrl(campaign);
        if (trackingUrl) {
          setAffiliateLinks(prev => ({ ...prev, [campaign.id]: trackingUrl }));
        }
      }

      if (!trackingUrl) {
        toast({
          title: "Error",
          description: "No tracking URL available",
          variant: "destructive",
        });
        return;
      }

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
              {campaign.is_top_offer && (
                <Badge variant="secondary">Top Offer</Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {campaign.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payout</span>
                <span className="font-semibold">${campaign.payout}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyToClipboard(campaign)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {affiliateLinks[campaign.id] && (
                  <Button variant="outline" asChild>
                    <a 
                      href={affiliateLinks[campaign.id]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}