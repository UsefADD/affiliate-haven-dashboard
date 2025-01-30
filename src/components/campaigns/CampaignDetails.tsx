import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Campaign } from "@/types/campaign";
import { Copy, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CampaignDetailsProps {
  campaign: Campaign | null;
  onClose: () => void;
  trackingUrl: string | null;
}

export function CampaignDetails({ campaign, onClose, trackingUrl }: CampaignDetailsProps) {
  const [subId, setSubId] = useState("");
  const { toast } = useToast();

  if (!campaign) return null;

  const getTrackingUrlWithSubId = () => {
    if (!trackingUrl) return "";
    return subId ? `${trackingUrl}/${subId}` : trackingUrl;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getTrackingUrlWithSubId());
      toast({
        title: "Copied!",
        description: "Tracking URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!campaign} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Campaign Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-medium mb-2">Campaign Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {campaign.name}</p>
              <p><span className="font-medium">Payout:</span> ${campaign.payout}</p>
              {campaign.description && (
                <p><span className="font-medium">Description:</span> {campaign.description}</p>
              )}
            </div>
          </div>

          {trackingUrl && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Tracking URL</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Sub ID (optional)"
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                  />
                  <Button onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Add a Sub ID to track clicks from different sources
                </p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <code className="text-sm break-all">{getTrackingUrlWithSubId()}</code>
              </div>
            </div>
          )}

          {campaign.creatives && campaign.creatives.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Creatives</h3>
              {campaign.creatives.map((creative, index) => (
                <div key={index} className="space-y-4 border rounded-lg p-4 mt-2">
                  <p><span className="font-medium">Type:</span> {creative.type}</p>
                  
                  {creative.content && (
                    <div>
                      <span className="font-medium">Content:</span>
                      <div className="mt-1 whitespace-pre-wrap">{creative.content}</div>
                    </div>
                  )}

                  {creative.type === "email" && creative.details && (
                    <div className="space-y-2">
                      {creative.details.fromNames && creative.details.fromNames.length > 0 && (
                        <div>
                          <span className="font-medium">From Names:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {creative.details.fromNames.map((name, i) => (
                              <li key={i}>{name}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {creative.details.subjects && creative.details.subjects.length > 0 && (
                        <div>
                          <span className="font-medium">Subject Lines:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {creative.details.subjects.map((subject, i) => (
                              <li key={i}>{subject}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {creative.images && creative.images.length > 0 && (
                    <div>
                      <span className="font-medium">Images:</span>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {creative.images.map((image, i) => (
                          <img
                            key={i}
                            src={image}
                            alt={`Creative ${index + 1} Image ${i + 1}`}
                            className="rounded-md w-full h-32 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}