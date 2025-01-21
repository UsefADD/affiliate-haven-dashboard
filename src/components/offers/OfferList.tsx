import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateLink {
  id: string;
  tracking_url: string;
  affiliate_id: string;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  is_top_offer?: boolean;
  links?: string[];
  creatives?: {
    type: "image" | "email";
    content: string;
    details?: {
      fromNames?: string[];
      subjects?: string[];
    };
    images?: string[];
  }[];
  affiliate_links?: AffiliateLink[];
}

interface OfferListProps {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onToggleStatus: (offerId: string, currentStatus: boolean) => void;
  onToggleTopOffer?: (offerId: string, currentTopStatus: boolean) => void;
  isAdmin?: boolean;
}

export function OfferList({ offers, onEdit, onToggleStatus, onToggleTopOffer, isAdmin = false }: OfferListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user?.id) {
        fetchAffiliateLinks(user.id);
        fetchUserProfile(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subdomain')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAffiliateLinks = async (userId: string) => {
    try {
      console.log("Fetching affiliate links for user:", userId);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('offer_id, tracking_url')
        .eq('affiliate_id', userId);

      if (error) throw error;

      console.log("Fetched affiliate links:", data);
      
      const linksMap = data?.reduce((acc, link) => ({
        ...acc,
        [link.offer_id]: link.tracking_url
      }), {}) || {};

      console.log("Processed affiliate links map:", linksMap);
      setAffiliateLinks(linksMap);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!currentUserId || !userProfile?.subdomain) return null;
    console.log("Getting tracking URL for offer:", offer.id);
    console.log("Current affiliate links:", affiliateLinks);
    console.log("Specific affiliate link:", affiliateLinks[offer.id]);
    
    // First check if there's a specific affiliate link for this offer
    const affiliateLink = affiliateLinks[offer.id];
    if (affiliateLink) {
      console.log("Using affiliate-specific link:", affiliateLink);
      return affiliateLink;
    }
    
    // If no specific affiliate link is found, generate one using the subdomain
    const defaultLink = offer.links && offer.links.length > 0 ? offer.links[0] : null;
    if (defaultLink) {
      // Parse the URL and add subdomain
      try {
        const url = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
        const newUrl = `https://${userProfile.subdomain}.${url.hostname}${url.pathname}${url.search}`;
        console.log("Generated subdomain URL:", newUrl);
        return newUrl;
      } catch (error) {
        console.error('Error parsing URL:', error);
        return defaultLink;
      }
    }
    console.log("Using default link:", defaultLink);
    return defaultLink;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payout</TableHead>
              {!isAdmin && <TableHead>Your Tracking Link</TableHead>}
              <TableHead>Creatives</TableHead>
              {isAdmin && (
                <>
                  <TableHead>Status</TableHead>
                  <TableHead>Top Offer</TableHead>
                </>
              )}
              <TableHead>Created At</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">
                  {offer.creatives?.some(c => c.type === "image") && (
                    <div className="w-20 mb-2">
                      <AspectRatio ratio={16/9}>
                        <img
                          src={offer.creatives.find(c => c.type === "image")?.content}
                          alt={offer.name}
                          className="rounded-md object-cover"
                        />
                      </AspectRatio>
                    </div>
                  )}
                  {offer.name}
                </TableCell>
                <TableCell>{offer.description || 'N/A'}</TableCell>
                <TableCell>${offer.payout}</TableCell>
                {!isAdmin && (
                  <TableCell>
                    {getTrackingUrl(offer) || 'No tracking link assigned'}
                  </TableCell>
                )}
                <TableCell>{offer.creatives?.length || 0} creatives</TableCell>
                {isAdmin && (
                  <>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(offer.id, offer.status)}
                      >
                        {offer.status ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleTopOffer?.(offer.id, offer.is_top_offer || false)}
                      >
                        <Star className={`h-4 w-4 ${offer.is_top_offer ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      </Button>
                    </TableCell>
                  </>
                )}
                <TableCell>
                  {new Date(offer.created_at).toLocaleDateString()}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}