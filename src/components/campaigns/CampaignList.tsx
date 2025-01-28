import { Campaign } from "@/types/campaign";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface CampaignListProps {
  campaigns: Campaign[];
  onViewDetails?: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onViewDetails }: CampaignListProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [trackingUrls, setTrackingUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTrackingUrls = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subdomain')
        .eq('id', user.id)
        .single();

      const urls: Record<string, string> = {};
      
      for (const campaign of campaigns) {
        if (campaign.links?.[0]) {
          let trackingUrl = `${window.location.origin}/track/${user.id}/${campaign.id}`;
          
          // Store both the tracking URL and the final destination with subdomain
          if (profile?.subdomain) {
            try {
              const destinationUrl = new URL(campaign.links[0]);
              destinationUrl.hostname = `${profile.subdomain}.${destinationUrl.hostname}`;
              urls[campaign.id] = trackingUrl;
            } catch (error) {
              console.error('Error processing URL:', error);
              urls[campaign.id] = trackingUrl;
            }
          } else {
            urls[campaign.id] = trackingUrl;
          }
        }
      }
      
      setTrackingUrls(urls);
    };

    fetchTrackingUrls();
  }, [campaigns]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="relative overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">{campaign.name}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-600">
                ${campaign.payout}
              </span>
              {trackingUrls[campaign.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(trackingUrls[campaign.id])}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              )}
            </div>
            {onViewDetails && (
              <Button
                className="w-full"
                onClick={() => onViewDetails(campaign)}
              >
                View Details
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}