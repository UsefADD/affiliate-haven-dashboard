import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Offer } from "@/types/offer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OfferListProps {
  offers: Offer[];
  onEdit?: (offer: Offer) => void;
  onDelete?: (offer: Offer) => void;
  onToggleStatus?: (offerId: string, currentStatus: boolean) => Promise<void>;
  onToggleTopOffer?: (offerId: string, currentTopStatus: boolean) => Promise<void>;
  isAdmin?: boolean;
  onViewDetails?: (campaign: Campaign) => void;
}

export default function OfferList({ 
  offers, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onToggleTopOffer,
  isAdmin = false,
  onViewDetails 
}: OfferListProps) {
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);
  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: "Failed to fetch affiliate links",
          variant: "destructive",
        });
      }
    };

    fetchAffiliateLinks();
  }, [toast]);

  const getTrackingUrl = async (offer: Offer) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Generate tracking URL in the format /track/{offerId}/{affiliateId}
    const baseUrl = window.location.origin;
    return `${baseUrl}/track/${offer.id}/${user.id}`;
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
          {offers.map((campaign) => (
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
                {isAdmin ? (
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(campaign)}
                        className="hover:bg-primary/10 text-primary"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(campaign)}
                        className="hover:bg-destructive/10 text-destructive"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails?.(campaign as Campaign)}
                    className="hover:bg-primary/10 text-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}