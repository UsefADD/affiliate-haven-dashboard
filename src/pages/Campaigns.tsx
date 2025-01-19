import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campaign } from "@/types/campaign";
import { useState } from "react";

const mockCampaigns: Campaign[] = [
  {
    id: 8,
    name: "EMAIL - Summer Sale Promotion",
    payout: "$30.00 per lead",
    availability: "Approved",
    links: ["https://example.com/summer-sale"],
    creatives: [
      {
        type: "email",
        content: "Summer Sale Email Template",
        details: {
          fromNames: [
            "Special Offers",
            "Exclusive Deals",
            "Summer Savings"
          ],
          subjects: [
            "Don't Miss Our Biggest Summer Sale!",
            "Limited Time: Summer Deals Inside",
            "Your Exclusive Summer Savings"
          ]
        },
        images: [
          "/placeholder.svg",
          "/placeholder.svg",
          "/placeholder.svg"
        ]
      }
    ]
  },
  {
    id: 501,
    name: "EMAIL - Black Friday Preview",
    payout: "$60.00 per action",
    availability: "Approved",
    links: ["https://example.com/black-friday"],
    creatives: [
      {
        type: "email",
        content: "Black Friday Email Template",
        details: {
          fromNames: [
            "Black Friday Deals",
            "Early Access Offers",
            "VIP Deals"
          ],
          subjects: [
            "Early Access: Black Friday Deals Inside",
            "VIP Preview: Black Friday Savings",
            "Exclusive Black Friday Access"
          ]
        },
        images: [
          "/placeholder.svg",
          "/placeholder.svg",
          "/placeholder.svg"
        ]
      }
    ]
  },
];

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFromName, setSelectedFromName] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.id}</TableCell>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.payout}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      campaign.availability === "Approved" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {campaign.availability}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCampaign(campaign)}
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