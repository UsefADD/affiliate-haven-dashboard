import { Campaign } from "@/types/campaign";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CampaignDetailsProps {
  campaign: Campaign | null;
  onClose: () => void;
  trackingUrl?: string | null;
}

export function CampaignDetails({ campaign, onClose, trackingUrl: propTrackingUrl }: CampaignDetailsProps) {
  const { toast } = useToast();
  const [formattedTrackingUrl, setFormattedTrackingUrl] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subdomain')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!campaign) return;

    const getFormattedTrackingUrl = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First check for specific affiliate link
      const { data: affiliateLink } = await supabase
        .from('affiliate_links')
        .select('tracking_url')
        .eq('offer_id', campaign.id)
        .eq('affiliate_id', user.id)
        .single();

      if (affiliateLink?.tracking_url) {
        return affiliateLink.tracking_url;
      }

      // If user has subdomain, generate subdomain URL
      if (userProfile?.subdomain) {
        try {
          // Generate tracking URL with subdomain first
          const trackingUrl = `https://${userProfile.subdomain}.trackoffers.net/track/${campaign.id}`;
          return trackingUrl;
        } catch (error) {
          console.error('Error generating tracking URL:', error);
        }
      }

      // Fallback to first campaign link
      if (campaign.links && campaign.links.length > 0) {
        const link = campaign.links[0];
        return link.startsWith('http') ? link : `https://${link}`;
      }

      return null;
    };

    getFormattedTrackingUrl().then(url => setFormattedTrackingUrl(url));
  }, [campaign, userProfile]);

  const handleCopyToClipboard = async () => {
    if (formattedTrackingUrl) {
      try {
        await navigator.clipboard.writeText(formattedTrackingUrl);
        toast({
          title: "Copied!",
          description: "Tracking URL copied to clipboard",
        });
      } catch (err) {
        console.error('Failed to copy:', err);
        toast({
          title: "Error",
          description: "Failed to copy URL to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div>
            <Badge variant={campaign.status ? "success" : "secondary"}>
              {campaign.status ? "Approved" : "Pending"}
            </Badge>
          </div>
          <div>
            <p>Payout: ${campaign.payout}</p>
          </div>
          <div>
            <p>Tracking URL:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formattedTrackingUrl || ""}
                readOnly
                className="border rounded p-2 w-full"
              />
              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline">
                <a href={formattedTrackingUrl || ''} target="_blank" rel="noopener noreferrer">
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