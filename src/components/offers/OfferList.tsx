import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Star, Trash2, Copy } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AffiliateVisibilityDialog } from "./AffiliateVisibilityDialog";
import { Users } from "lucide-react";

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
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user?.id) {
        fetchUserProfile(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subdomain')
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

  const getTrackingUrl = (offer: Offer) => {
    if (!currentUserId) {
      console.log("No user profile found");
      return null;
    }

    return `/track/${currentUserId}/${offer.id}`;
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
                    <div className="flex items-center space-x-2">
                      <span className="text-sm truncate max-w-[200px]">
                        {getTrackingUrl(offer) ? `${window.location.origin}${getTrackingUrl(offer)}` : 'No tracking link available'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setVisibilityDialogOpen(true);
                        }}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Visibility
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(offer)}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
      {selectedOffer && (
        <AffiliateVisibilityDialog
          offer={selectedOffer}
          isOpen={visibilityDialogOpen}
          onClose={() => {
            setVisibilityDialogOpen(false);
            setSelectedOffer(null);
          }}
        />
      )}
    </div>
  );
}
