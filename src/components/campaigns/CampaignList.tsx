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
  const [userProfile, setUserProfile] = useState<{ subdomain?: string, id?: string } | null>(null);

  useEffect(() => {
    fetchAffiliateLinks();
  }, []);

  const fetchAffiliateLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Fetching affiliate links for user:", user.id);
      const { data: links, error } = await supabase
        .from('affiliate_links')
        .select('offer_id, tracking_url')
        .eq('affiliate_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching affiliate links:', error);
        return;
      }

      console.log("Fetched affiliate links:", links);
      const linksMap = links ? { [links.offer_id]: links.tracking_url } : {};
      setAffiliateLinks(linksMap);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subdomain, id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      console.log("Fetched user profile:", profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error in fetchAffiliateLinks:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!userProfile?.id) {
      console.log("No user profile found");
      return `/api/track-click/${offer.id}`;
    }

    try {
      // Generate tracking URL with user ID and offer ID
      return `/api/track-click/${userProfile.id}/${offer.id}`;
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