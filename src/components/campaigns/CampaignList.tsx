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

  const handleCopyToClipboard = async (trackingUrl: string) => {
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

  const getTrackingUrl = (campaign: Offer) => {
    if (!profile?.subdomain) {
      console.log("No subdomain found for affiliate");
      return '';
    }

    const baseUrl = `https://${profile.subdomain}.trackoffers.net`;
    const trackingPath = `/track/${campaign.id}/${profile.id}`;
    return `${baseUrl}${trackingPath}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => {
        const trackingUrl = getTrackingUrl(campaign);
        
        return (
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
                    onClick={() => handleCopyToClipboard(trackingUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="outline">
                    <a 
                      href={trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}