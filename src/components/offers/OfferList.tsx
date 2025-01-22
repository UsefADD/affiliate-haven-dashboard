import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Star, Trash2, Copy } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  onDelete: (offer: Offer) => void;
  onToggleStatus: (offerId: string, currentStatus: boolean) => void;
  onToggleTopOffer?: (offerId: string, currentTopStatus: boolean) => void;
  isAdmin?: boolean;
}

export function OfferList({ offers, onEdit, onDelete, onToggleStatus, onToggleTopOffer, isAdmin = false }: OfferListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);
  const { toast } = useToast();

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
      
      const linksMap = data?.reduce((acc, link) => ({
        ...acc,
        [link.offer_id]: link.tracking_url
      }), {}) || {};

      setAffiliateLinks(linksMap);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!currentUserId) return null;
    
    // First check if there's a specific affiliate link for this offer
    const affiliateLink = affiliateLinks[offer.id];
    if (affiliateLink) {
      const trackingUrl = `/track/${offer.id}/${currentUserId}?target=${encodeURIComponent(affiliateLink)}`;
      return trackingUrl;
    }
    
    // If no specific affiliate link is found, generate one using the first offer link
    const defaultLink = offer.links && offer.links.length > 0 ? offer.links[0] : null;
    if (defaultLink) {
      // Generate tracking URL with the default link
      const trackingUrl = `/track/${offer.id}/${currentUserId}?target=${encodeURIComponent(defaultLink)}`;
      return trackingUrl;
    }
    
    return null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + text);
      toast({
        title: "Success",
        description: "Tracking link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy tracking link",
        variant: "destructive",
      });
    }
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
                    {getTrackingUrl(offer) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 truncate max-w-[200px]">
                          {window.location.origin + getTrackingUrl(offer)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => getTrackingUrl(offer) && copyToClipboard(getTrackingUrl(offer)!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No tracking link available</span>
                    )}
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
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(offer)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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