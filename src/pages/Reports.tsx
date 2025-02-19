import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  created_at: string;
  offers: {
    id: string;
    name: string;
  } | null;
}

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clicksByOffer, setClicksByOffer] = useState<Record<string, ClickData[]>>({});
  const { toast } = useToast();

  const handleDateRangeChange = async ({ from, to }: { from: Date; to: Date }) => {
    console.log("Handling date range change with dates:", { 
      from: from.toISOString(), 
      to: to.toISOString() 
    });
    
    setIsLoading(true);
    try {
      const clicksPromise = fetchClicks(from, to);
      const leadsPromise = fetchLeads(from, to);
      
      const [clicksResult, leadsResult] = await Promise.all([clicksPromise, leadsPromise]);
      
      console.log("Fetched data:", {
        clicks: clicksResult,
        leads: leadsResult
      });

      if (!clicksResult.length && !leadsResult.length) {
        toast({
          title: "No Data Available",
          description: `No reports found for the selected date range`,
        });
      }
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

  const fetchClicks = async (startDate: Date, endDate: Date): Promise<ClickData[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return [];
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

      setClickData(data || []);

      const groupedClicks = (data || []).reduce((acc: Record<string, ClickData[]>, click) => {
        if (!click.offers?.id) return acc;
        if (!acc[click.offers.id]) {
          acc[click.offers.id] = [];
        }
        acc[click.offers.id].push(click);
        return acc;
      }, {});

      setClicksByOffer(groupedClicks);
      return data || [];
    } catch (error) {
      console.error('Error in fetchClicks:', error);
      throw error;
    }
  };

  const fetchLeads = async (startDate: Date, endDate: Date): Promise<LeadData[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return [];
      }

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          status,
          payout,
          variable_payout,
          created_at,
          offers (
            id,
            name
          )
        `)
        .eq('affiliate_id', user.id)
        .eq('status', 'converted')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        throw error;
      }

      console.log("Fetched leads for date range:", {
        startDate: startOfDay(startDate).toISOString(),
        endDate: endOfDay(endDate).toISOString(),
        leadsCount: data?.length,
        leads: data
      });

      setLeadsData(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      throw error;
    }
  };

  const campaignStats = Object.entries(clicksByOffer).reduce((acc: Record<string, CampaignStats>, [offerId, clicks]) => {
    if (!clicks.length || !clicks[0].offers) return acc;
    
    const campaign = clicks[0].offers;
    const campaignLeads = leadsData.filter(lead => lead.offers?.id === offerId);
    
    acc[offerId] = {
      id: campaign.id,
      name: campaign.name,
      clicks: clicks.length,
      conversions: campaignLeads.length,
      earnings: campaignLeads.reduce((sum, lead) => sum + Number(lead.payout), 0),
      conversionRate: clicks.length > 0 ? (campaignLeads.length / clicks.length) * 100 : 0,
      epc: clicks.length > 0 ? (campaignLeads.reduce((sum, lead) => sum + Number(lead.payout), 0) / clicks.length) : 0
    };
    
    return acc;
  }, {});

  const calculateTotals = () => {
    return Object.values(campaignStats).reduce((acc, stats) => ({
      clicks: acc.clicks + stats.clicks,
      conversions: acc.conversions + stats.conversions,
      earnings: acc.earnings + stats.earnings,
      conversionRate: acc.clicks > 0 ? (acc.conversions / acc.clicks) * 100 : 0,
      epc: acc.clicks > 0 ? acc.earnings / acc.clicks : 0
    }), { clicks: 0, conversions: 0, earnings: 0, conversionRate: 0, epc: 0 });
  };

  useEffect(() => {
    const today = new Date();
    handleDateRangeChange({ from: today, to: today });
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
