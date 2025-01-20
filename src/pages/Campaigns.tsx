import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campaign } from "@/types/campaign";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
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
}

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFromName, setSelectedFromName] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers for campaigns page...");
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }

      console.log("Fetched offers for campaigns:", data);
      
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || []
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Email Marketing Campaigns</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>{offer.id}</TableCell>
                  <TableCell>{offer.name}</TableCell>
                  <TableCell>${offer.payout}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCampaign(offer as unknown as Campaign)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>
              View campaign information, email templates, and creative assets
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Campaign Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{selectedCampaign.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payout</p>
                    <p className="font-medium">{selectedCampaign.payout}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Affiliate Links</h4>
                <div className="space-y-2">
                  {selectedCampaign.links?.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm truncate mr-2">{link}</span>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(link)}>
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Email Marketing Assets</h4>
                <div className="space-y-4">
                  {selectedCampaign.creatives?.map((creative, index) => (
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
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
