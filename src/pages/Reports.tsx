import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { ClickDetailsDialog } from "@/components/reports/ClickDetailsDialog";
import { startOfDay, endOfDay } from "date-fns";

interface CampaignStats {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  epc: number;
  earnings: number;
}

interface ClickData {
  id: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  sub_id: string | null;
  offers: {
    id: string;
    name: string;
    payout: number;
  } | null;
}

interface LeadData {
  id: string;
  status: string;
  payout: number;
  variable_payout: boolean;
  offers: {
    id: string;
    name: string;
    payout: number;
  } | null;
}

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleDateRangeChange = async ({ from, to }: { from: Date; to: Date }) => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchClicks(from, to),
        fetchLeads(from, to)
      ]);
      
      toast({
        title: "Report Generated",
        description: `Showing results for selected date range`,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data for selected date range",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [clicksByOffer, setClicksByOffer] = useState<Record<string, ClickData[]>>({});

  const fetchClicks = async (startDate: Date, endDate: Date) => {
    try {
      console.log("Fetching clicks for date range:", { startDate, endDate });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select(`
          *,
          offers (
            id,
            name,
            payout
          )
        `)
        .eq('affiliate_id', user.id)
        .gte('clicked_at', startOfDay(startDate).toISOString())
        .lte('clicked_at', endOfDay(endDate).toISOString());

      if (error) {
        console.error("Error fetching clicks:", error);
        throw error;
      }

      console.log("Fetched clicks:", data);
      setClickData(data || []);

      // Group clicks by offer
      const groupedClicks = (data || []).reduce((acc: Record<string, ClickData[]>, click) => {
        if (!click.offers?.id) return acc;
        if (!acc[click.offers.id]) {
          acc[click.offers.id] = [];
        }
        acc[click.offers.id].push(click);
        return acc;
      }, {});

      setClicksByOffer(groupedClicks);
    } catch (error) {
      console.error('Error in fetchClicks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clicks data",
        variant: "destructive",
      });
    }
  };

  const fetchLeads = async (startDate: Date, endDate: Date) => {
    try {
      console.log("Fetching leads for date range:", { startDate, endDate });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          status,
          payout,
          variable_payout,
          offers (
            id,
            name,
            payout
          )
        `)
        .eq('affiliate_id', user.id)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      if (error) {
        console.error("Error fetching leads:", error);
        throw error;
      }

      console.log("Fetched leads:", data);
      setLeadsData(data || []);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate campaign stats from clicks and leads
  const campaignStats = Object.values(clicksByOffer).reduce((acc: Record<string, CampaignStats>, campaignClicks) => {
    if (!campaignClicks.length || !campaignClicks[0].offers) return acc;
    
    const campaignId = campaignClicks[0].offers.id;
    const campaignName = campaignClicks[0].offers.name;
    
    // Initialize campaign stats
    if (!acc[campaignId]) {
      acc[campaignId] = {
        id: campaignId,
        name: campaignName,
        clicks: campaignClicks.length,
        conversions: 0,
        earnings: 0,
        conversionRate: 0,
        epc: 0
      };
    }

    // Add conversions and earnings from leads
    const campaignLeads = leadsData.filter(lead => lead.offers?.id === campaignId);
    const convertedLeads = campaignLeads.filter(lead => lead.status === 'converted');
    
    acc[campaignId].conversions = convertedLeads.length;
    acc[campaignId].earnings = convertedLeads.reduce((total, lead) => total + Number(lead.payout), 0);
    
    // Calculate rates
    acc[campaignId].conversionRate = (acc[campaignId].conversions / acc[campaignId].clicks) * 100;
    acc[campaignId].epc = acc[campaignId].earnings / acc[campaignId].clicks;
    
    return acc;
  }, {});

  const calculateTotals = () => {
    const totals = Object.values(campaignStats).reduce((acc, stats) => {
      return {
        clicks: acc.clicks + stats.clicks,
        conversions: acc.conversions + stats.conversions,
        earnings: acc.earnings + stats.earnings,
      };
    }, { clicks: 0, conversions: 0, earnings: 0 });

    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;
    const epc = totals.clicks > 0 
      ? totals.earnings / totals.clicks 
      : 0;

    return {
      ...totals,
      conversionRate,
      epc,
    };
  };

  useEffect(() => {
    // Initialize with today's date
    handleDateRangeChange({ from: new Date(), to: new Date() });
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Campaigns Report</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <DateRangeSelector onDateChange={handleDateRangeChange} />
              <Button 
                onClick={() => handleDateRangeChange({ 
                  from: new Date(), 
                  to: new Date() 
                })}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Run Report
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search Campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conv. Rate</TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(campaignStats).length > 0 ? (
                  Object.entries(campaignStats)
                    .filter(([_, stats]) => 
                      stats.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(([key, stats]) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-sm">{stats.id.split('-')[0]}</TableCell>
                        <TableCell>{stats.name}</TableCell>
                        <TableCell>
                          <ClickDetailsDialog 
                            clicks={clicksByOffer[stats.id] || []}
                            campaignName={stats.name}
                          />
                        </TableCell>
                        <TableCell>{stats.conversions}</TableCell>
                        <TableCell>{stats.conversionRate.toFixed(2)}%</TableCell>
                        <TableCell>${stats.epc.toFixed(2)}</TableCell>
                        <TableCell>${stats.earnings.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No data found for selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {Object.entries(campaignStats).length > 0 && (
                <TableFooter className="bg-muted/50 font-medium">
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">Totals:</TableCell>
                    <TableCell>{totals.clicks}</TableCell>
                    <TableCell>{totals.conversions}</TableCell>
                    <TableCell>{totals.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell>${totals.epc.toFixed(2)}</TableCell>
                    <TableCell>${totals.earnings.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
