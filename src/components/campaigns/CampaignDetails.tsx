import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campaign } from "@/types/campaign";
import { useState } from "react";

interface CampaignDetailsProps {
  campaign: Campaign | null;
  onClose: () => void;
  trackingUrl: string | null;
}

export function CampaignDetails({ campaign, onClose, trackingUrl }: CampaignDetailsProps) {
  const [selectedFromName, setSelectedFromName] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");

  if (!campaign) return null;

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
          <DialogDescription>
            View campaign information, email templates, and creative assets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Campaign Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-medium">{campaign.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payout</p>
                <p className="font-medium">{campaign.payout}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Your Tracking Link</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm truncate mr-2">
                  {trackingUrl || 'No tracking link assigned'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (trackingUrl) navigator.clipboard.writeText(trackingUrl);
                  }}
                >
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
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Select "From" Name</p>
                        <Select onValueChange={setSelectedFromName} value={selectedFromName}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a from name..." />
                          </SelectTrigger>
                          <SelectContent>
                            {creative.details.fromNames?.map((name, idx) => (
                              <SelectItem key={idx} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Select Subject Line</p>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a subject line..." />
                          </SelectTrigger>
                          <SelectContent>
                            {creative.details.subjects?.map((subject, idx) => (
                              <SelectItem key={idx} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Select Creative Image</p>
                        <div className="grid grid-cols-2 gap-4">
                          {creative.images?.map((image, idx) => (
                            <div 
                              key={idx} 
                              className={`relative cursor-pointer rounded-lg overflow-hidden ${
                                selectedImage === image ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setSelectedImage(image)}
                            >
                              <img 
                                src={image} 
                                alt={`Creative ${idx + 1}`} 
                                className="w-full h-auto"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute bottom-2 right-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add download logic here
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}