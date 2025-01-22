import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CampaignDetailsProps {
  campaign: Campaign | null;
  onClose: () => void;
  trackingUrl: string | null;
}

export function CampaignDetails({ campaign, onClose, trackingUrl }: CampaignDetailsProps) {
  const [userProfile, setUserProfile] = useState<{ subdomain?: string } | null>(null);
  const [formattedTrackingUrl, setFormattedTrackingUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subdomain')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const getFormattedTrackingUrl = async () => {
      if (!campaign) return null;
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

      // If no specific link but user has subdomain and campaign has links
      if (userProfile?.subdomain && campaign.links && campaign.links.length > 0) {
        const defaultLink = campaign.links[0];
        let pathAndQuery = '';
        try {
          const url = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
          pathAndQuery = url.pathname + url.search;
        } catch (e) {
          pathAndQuery = defaultLink;
        }
        
        return `https://${userProfile.subdomain}.trackoffers.net${pathAndQuery}`;
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

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creative-${Date.now()}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-[90vw] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Campaign Details</DialogTitle>
          <DialogDescription>
            View campaign information, email templates, and creative assets
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Campaign Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">{campaign.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payout</p>
                  <p className="font-medium">${campaign.payout}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Your Tracking Link</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm truncate mr-2">
                    {formattedTrackingUrl || 'No tracking link assigned'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Email Marketing Assets</h4>
              <div className="space-y-4">
                {campaign.creatives?.map((creative, index) => (
                  <div key={index} className="p-4 bg-muted rounded-md">
                    {creative.type === "email" && creative.details && (
                      <div className="space-y-4">
                        {creative.details.fromNames && creative.details.fromNames.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Available "From" Names:</p>
                            <div className="space-y-1">
                              {creative.details.fromNames.map((name, idx) => (
                                <div key={idx} className="text-sm p-2 bg-background rounded">
                                  {name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {creative.details.subjects && creative.details.subjects.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Available Subject Lines:</p>
                            <div className="space-y-1">
                              {creative.details.subjects.map((subject, idx) => (
                                <div key={idx} className="text-sm p-2 bg-background rounded">
                                  {subject}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {creative.images && creative.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Creative Images:</p>
                        <div className="grid grid-cols-2 gap-4">
                          {creative.images.map((image, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden">
                              <img 
                                src={image} 
                                alt={`Creative ${idx + 1}`} 
                                className="w-full h-auto object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <Button 
                                  variant="secondary"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  onClick={() => handleDownload(image)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
