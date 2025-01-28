import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CampaignStats {
  id: string;
  name: string;
  totalLeads: number;
  conversions: number;
  lastConversion: string | null;
  earnings: number;
  clicks: number;
  conversionRate: number;
  epc: number;
}

interface Lead {
  id: string;
  offers: {
    id: string;
    name: string;
    payout: number;
  };
  status: string;
  created_at: string;
  conversion_date: string | null;
}

export default function Reports() {
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState<Lead[]>([]);
  const [clickData, setClickData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchLeads(), fetchClicks()]);
  }, []);

  const fetchLeads = async () => {
    try {
      console.log("Fetching leads for reports...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          status,
          created_at,
          conversion_date,
          offers:offer_id (
            id,
            name,
            payout
          )
        `)
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        throw error;
      }

      console.log("Fetched leads:", data);
      setReportData(data || []);
      setFilteredData(data || []);
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

  const fetchClicks = async () => {
    try {
      console.log("Fetching clicks for reports...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id);

      if (error) {
        console.error("Error fetching clicks:", error);
        throw error;
      }

      console.log("Fetched clicks:", data);
      setClickData(data || []);
    } catch (error) {
      console.error('Error in fetchClicks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clicks data",
        variant: "destructive",
      });
    }
  };

  const handleRunReport = () => {
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date to filter the report",
        variant: "destructive",
      });
      return;
    }

    console.log("Selected date:", date);
    const selectedStartDate = startOfDay(date);
    const selectedEndDate = endOfDay(date);
    
    console.log("Filtering between:", selectedStartDate, "and", selectedEndDate);

    const filtered = reportData.filter(lead => {
      const leadDate = new Date(lead.created_at);
      console.log("Lead date:", leadDate);
      return leadDate >= selectedStartDate && leadDate <= selectedEndDate;
    });

    console.log("Filtered data:", filtered);
    setFilteredData(filtered);
    
    toast({
      title: "Report Generated",
      description: `Showing results for ${format(date, "MMM d, yyyy")}`,
    });
  };

  // Calculate campaign stats including clicks and EPC
  const campaignStats = filteredData.reduce((acc, lead) => {
    const campaignId = lead.offers.id;
    const campaignName = lead.offers.name;
    const key = `${campaignId} - ${campaignName}`;
    
    if (!acc[key]) {
      // Get clicks for this campaign
      const campaignClicks = clickData.filter(click => click.offer_id === campaignId).length;
      
      acc[key] = {
        id: campaignId,
        name: campaignName,
        totalLeads: 0,
        conversions: 0,
        lastConversion: null,
        earnings: 0,
        clicks: campaignClicks,
        conversionRate: 0,
        epc: 0
      };
    }
    
    acc[key].totalLeads++;
    if (lead.status === 'converted') {
      acc[key].conversions++;
      acc[key].earnings += lead.offers.payout;
      if (!acc[key].lastConversion || new Date(lead.conversion_date!) > new Date(acc[key].lastConversion!)) {
        acc[key].lastConversion = lead.conversion_date;
      }
    }
    
    // Calculate conversion rate and EPC
    acc[key].conversionRate = acc[key].clicks > 0 
      ? (acc[key].conversions / acc[key].clicks) * 100 
      : 0;
    
    acc[key].epc = acc[key].clicks > 0 
      ? acc[key].earnings / acc[key].clicks 
      : 0;
    
    return acc;
  }, {} as Record<string, CampaignStats>);

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

  return (
    <DashboardLayout>
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Campaigns Report</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Input
              type="text"
              placeholder="Search Campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-[300px]"
            />
            <Button 
              className="bg-green-600 hover:bg-green-700 ml-auto"
              onClick={handleRunReport}
            >
              Run Report
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conv. Rate</TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Last Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(campaignStats).length > 0 ? (
                  Object.entries(campaignStats).map(([key, stats]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-sm">{stats.id.split('-')[0]}</TableCell>
                      <TableCell>{stats.name}</TableCell>
                      <TableCell>{stats.totalLeads}</TableCell>
                      <TableCell>{stats.clicks}</TableCell>
                      <TableCell>{stats.conversions}</TableCell>
                      <TableCell>{stats.conversionRate.toFixed(2)}%</TableCell>
                      <TableCell>${stats.epc.toFixed(2)}</TableCell>
                      <TableCell>${stats.earnings.toFixed(2)}</TableCell>
                      <TableCell>
                        {stats.lastConversion 
                          ? format(new Date(stats.lastConversion), 'MMM d, yyyy HH:mm:ss')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}