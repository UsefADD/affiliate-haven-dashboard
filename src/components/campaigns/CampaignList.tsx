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
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);

  useEffect(() => {
    const fetchAffiliateLinks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("Fetching affiliate links for user:", user.id);
        const { data: links, error } = await supabase
          .from('affiliate_links')
          .select('offer_id, tracking_url')
          .eq('affiliate_id', user.id);

        if (error) throw error;

        console.log("Fetched affiliate links:", links);
        const linksMap = links?.reduce((acc, link) => ({
          ...acc,
          [link.offer_id]: link.tracking_url
        }), {});

        setAffiliateLinks(linksMap);

        // Fetch user profile for subdomain
        const { data: profile } = await supabase
          .from('profiles')
          .select('subdomain')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching affiliate links:', error);
      }
    };

    fetchAffiliateLinks();
  }, []);

  const getTrackingUrl = (offer: Offer) => {
    // First check if there's a specific affiliate link
    const affiliateLink = affiliateLinks[offer.id];
    if (affiliateLink) {
      console.log("Using affiliate-specific link for offer", offer.id, ":", affiliateLink);
      return affiliateLink;
    }
    
    // If no specific affiliate link and user has subdomain, generate one from offer links
    if (userProfile?.subdomain && offer.links && offer.links.length > 0) {
      try {
        const defaultLink = offer.links[0];
        const url = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
        const newUrl = `https://${userProfile.subdomain}.${url.hostname}${url.pathname}${url.search}`;
        console.log("Generated subdomain URL for offer", offer.id, ":", newUrl);
        return newUrl;
      } catch (error) {
        console.error('Error generating tracking URL:', error);
        return offer.links[0];
      }
    }

    // If no specific link and no subdomain, use the first offer link
    if (offer.links && offer.links.length > 0) {
      return offer.links[0];
    }

    return null;
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