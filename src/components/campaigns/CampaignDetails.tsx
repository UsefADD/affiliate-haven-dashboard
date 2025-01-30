import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Campaign } from "@/types/campaign";
import { X } from "lucide-react";

interface CampaignDetailsProps {
  campaign: Campaign | null;
  onClose: () => void;
}

export function CampaignDetails({ campaign, onClose }: CampaignDetailsProps) {
  if (!campaign) return null;

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${campaign.id}-image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
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
                          <div key={i} className="relative group">
                            <img
                              src={image}
                              alt={`Creative ${index + 1} Image ${i + 1}`}
                              className="rounded-md w-full h-32 object-cover"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDownloadImage(image)}
                            >
                              Download
                            </Button>
                          </div>
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