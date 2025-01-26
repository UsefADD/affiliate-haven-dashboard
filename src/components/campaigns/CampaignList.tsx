import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Offer } from "@/types/offer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CampaignListProps {
  campaigns: Offer[];
  onViewDetails: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onViewDetails }: CampaignListProps) {
  const [userProfile, setUserProfile] = useState<{ subdomain?: string, id?: string } | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});

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

    try {
      // First check if there's a specific affiliate link for this offer
      if (affiliateLinks[offer.id]) {
        console.log("Using affiliate-specific link:", affiliateLinks[offer.id]);
        return `/api/track-click/${userProfile.id}/${offer.id}`;
      }

      // If no specific link and user has subdomain, generate one from offer links
      if (userProfile?.subdomain && offer.links && offer.links.length > 0) {
        try {
          const defaultLink = offer.links[0];
          // Handle links with or without protocol
          const url = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
          
          // Extract the base domain (remove any existing subdomains)
          const domainParts = url.hostname.split('.');
          const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : url.hostname;
          
          // Construct new URL with subdomain
          const destinationUrl = `https://${userProfile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
          console.log("Generated subdomain URL:", destinationUrl);
          
          return `/api/track-click/${userProfile.id}/${offer.id}`;
        } catch (error) {
          console.error('Error generating tracking URL:', error);
          return null;
        }
      }

      // If no specific link and no subdomain, use the first offer link
      if (offer.links && offer.links.length > 0) {
        return `/api/track-click/${userProfile.id}/${offer.id}`;
      }

      return null;
    } catch (error) {
      console.error('Error in getTrackingUrl:', error);
      return null;
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
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}