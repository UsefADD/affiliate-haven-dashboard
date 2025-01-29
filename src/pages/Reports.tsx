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
  conversions: number;
  earnings: number;
  clicks: number;
  conversionRate: number;
  epc: number;
}

export default function Reports() {
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [clickData, setClickData] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any[]>([]);
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
        .select(`
          *,
          offers:offer_id (
            id,
            name,
            payout
          )
        `)
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

    // Filter clicks based on date
    const filteredClicks = clickData.filter(click => {
      const clickDate = new Date(click.clicked_at);
      return clickDate >= selectedStartDate && clickDate <= selectedEndDate;
    });

    console.log("Filtered clicks:", filteredClicks);
    setClickData(filteredClicks);
    
    toast({
      title: "Report Generated",
      description: `Showing results for ${format(date, "MMM d, yyyy")}`,
    });
  };

  // Calculate campaign stats from clicks and conversions
  const campaignStats = clickData.reduce((acc: Record<string, CampaignStats>, click) => {
    if (!click.offers) return acc;
    
    const campaignId = click.offers.id;
    const campaignName = click.offers.name;
    const key = `${campaignId}`;
    
    if (!acc[key]) {
      // Initialize stats for new campaign
      acc[key] = {
        id: campaignId,
        name: campaignName,
        conversions: 0,
        earnings: 0,
        clicks: 0,
        conversionRate: 0,
        epc: 0
      };
    }
    
    // Increment clicks
    acc[key].clicks++;
    
    // Calculate conversions and earnings from leads data
    const campaignLeads = leadsData.filter(lead => lead.offers.id === campaignId);
    acc[key].conversions = campaignLeads.filter(lead => lead.status === 'converted').length;
    acc[key].earnings = campaignLeads.reduce((sum, lead) => 
      lead.status === 'converted' ? sum + lead.offers.payout : sum, 0
    );
    
    // Calculate rates
    acc[key].conversionRate = (acc[key].conversions / acc[key].clicks) * 100;
    acc[key].epc = acc[key].earnings / acc[key].clicks;
    
    return acc;
  }, {});

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
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conv. Rate</TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(campaignStats).length > 0 ? (
                  Object.entries(campaignStats).map(([key, stats]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-sm">{stats.id.split('-')[0]}</TableCell>
                      <TableCell>{stats.name}</TableCell>
                      <TableCell>{stats.clicks}</TableCell>
                      <TableCell>{stats.conversions}</TableCell>
                      <TableCell>{stats.conversionRate.toFixed(2)}%</TableCell>
                      <TableCell>${stats.epc.toFixed(2)}</TableCell>
                      <TableCell>${stats.earnings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
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