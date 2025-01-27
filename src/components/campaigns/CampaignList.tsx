import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Offer } from "@/types/offer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignListProps {
  campaigns: Offer[];
  onViewDetails: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onViewDetails }: CampaignListProps) {
  const [userProfile, setUserProfile] = useState<{ subdomain?: string, id?: string } | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        fetchUserProfile(user.id);
        fetchAffiliateLinks(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subdomain, id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log("Fetched user profile:", profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const fetchAffiliateLinks = async (userId: string) => {
    try {
      console.log("Fetching affiliate links for user:", userId);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('offer_id, tracking_url')
        .eq('affiliate_id', userId);

      if (error) {
        console.error('Error fetching affiliate links:', error);
        return;
      }

      const linksMap = data?.reduce((acc, link) => ({
        ...acc,
        [link.offer_id]: link.tracking_url
      }), {});

      console.log("Processed affiliate links map:", linksMap);
      setAffiliateLinks(linksMap || {});
    } catch (error) {
      console.error('Error in fetchAffiliateLinks:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!userProfile?.id) {
      console.log("No user profile found");
      return null;
    }

    return `/api/track-click/${userProfile.id}/${offer.id}`;
  };

  const handleCopyLink = async (offer: Offer) => {
    const trackingUrl = getTrackingUrl(offer);
    if (trackingUrl) {
      try {
        const fullUrl = `${window.location.origin}${trackingUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        toast({
          title: "Success",
          description: "Tracking link copied to clipboard",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Error",
          description: "Failed to copy tracking link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Campaign Name</TableHead>
            <TableHead className="font-semibold">Payout</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Your Tracking Link</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const trackingUrl = getTrackingUrl(campaign);
            return (
              <TableRow 
                key={campaign.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm">{campaign.id.split('-')[0]}</TableCell>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="text-green-600 font-semibold">
                  ${campaign.payout}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={campaign.status ? "success" : "secondary"}
                  >
                    {campaign.status ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trackingUrl ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm truncate max-w-[200px]">
                        {`${window.location.origin}${trackingUrl}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(campaign)}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No tracking link available</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(campaign as Campaign)}
                    className="hover:bg-primary/10 text-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}