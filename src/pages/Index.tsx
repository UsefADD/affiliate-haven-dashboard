import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, DollarSign, Users, Link as LinkIcon, Search, Star } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { Campaign } from "@/types/campaign";
import { useState } from "react";

const mockCampaigns: Campaign[] = [
  {
    id: 8,
    name: "HOME SERVICES - SENSITIVE Choice Home Warranty",
    payout: "$30.00 per lead",
    availability: "Approved",
    links: ["https://example.com/link1", "https://example.com/link2"],
    creatives: ["Banner 300x250", "Banner 728x90"]
  },
  {
    id: 501,
    name: "ECOMM - 1Tac - TC1200",
    payout: "$60.00 per action",
    availability: "Approved",
    links: ["https://example.com/link3"],
    creatives: ["Video Ad", "Social Media Banner"]
  },
  // ... Add more mock campaigns as needed
];

const mockData = {
  earnings: {
    total: "$5,234.89",
    change: "+12.5%",
    period: "vs last month",
  },
  conversions: {
    total: "156",
    change: "+8.2%",
    period: "vs last month",
  },
  clicks: {
    total: "2,345",
    change: "+15.3%",
    period: "vs last month",
  },
};

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
  { month: "Jul", sales: 7000 },
];

const clickData = [
  { month: "Jan", clicks: 1200 },
  { month: "Feb", clicks: 1800 },
  { month: "Mar", clicks: 2400 },
  { month: "Apr", clicks: 2100 },
  { month: "May", clicks: 2800 },
  { month: "Jun", clicks: 3200 },
  { month: "Jul", clicks: 3600 },
];

export default function Index() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Metrics Overview */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="metric-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <h2 className="text-3xl font-bold">{mockData.earnings.total}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">
                {mockData.earnings.change}
              </span>
              <span className="text-muted-foreground ml-2">
                {mockData.earnings.period}
              </span>
            </div>
          </Card>

          <Card className="metric-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conversions</p>
                <h2 className="text-3xl font-bold">{mockData.conversions.total}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">
                {mockData.conversions.change}
              </span>
              <span className="text-muted-foreground ml-2">
                {mockData.conversions.period}
              </span>
            </div>
          </Card>

          <Card className="metric-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <h2 className="text-3xl font-bold">{mockData.clicks.total}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">
                {mockData.clicks.change}
              </span>
              <span className="text-muted-foreground ml-2">
                {mockData.clicks.period}
              </span>
            </div>
          </Card>
        </section>

        {/* Campaigns Section */}
        <section>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Campaigns</h2>
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
        </section>

        {/* Charts Section */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales",
                    theme: {
                      light: "#0ea5e9",
                      dark: "#38bdf8",
                    },
                  },
                }}
              >
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Sales
                              </span>
                              <span className="font-bold text-muted-foreground">
                                ${payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Click Trends</h3>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  clicks: {
                    label: "Clicks",
                    theme: {
                      light: "#10b981",
                      dark: "#34d399",
                    },
                  },
                }}
              >
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Clicks
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }} />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>
        </section>

        {/* Campaign Details Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Campaign Details</DialogTitle>
              <DialogDescription>
                View campaign information, links, and creative assets
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
                  <h4 className="text-sm font-medium mb-2">Creative Assets</h4>
                  <div className="space-y-2">
                    {selectedCampaign.creatives?.map((creative, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">{creative}</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
