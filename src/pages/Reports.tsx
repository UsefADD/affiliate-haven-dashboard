import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  offers: {
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
  const [category, setCategory] = useState("");
  const [reportData, setReportData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
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

  const handleRunReport = () => {
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date to filter the report",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = format(date, 'yyyy-MM-dd');
    const filteredData = reportData.filter(lead => {
      const leadDate = lead.created_at.split('T')[0];
      return leadDate === selectedDate;
    });

    setReportData(filteredData);
    toast({
      title: "Report Generated",
      description: `Showing results for ${format(date, "MMM d, yyyy")}`,
    });
  };

  // Calculate totals
  const campaignStats = reportData.reduce((acc, lead) => {
    const campaignName = lead.offers.name;
    if (!acc[campaignName]) {
      acc[campaignName] = {
        totalLeads: 0,
        conversions: 0,
        lastConversion: null,
        earnings: 0
      };
    }
    
    acc[campaignName].totalLeads++;
    if (lead.status === 'converted') {
      acc[campaignName].conversions++;
      acc[campaignName].earnings += lead.offers.payout;
      if (!acc[campaignName].lastConversion || new Date(lead.conversion_date!) > new Date(acc[campaignName].lastConversion!)) {
        acc[campaignName].lastConversion = lead.conversion_date;
      }
    }
    
    return acc;
  }, {} as Record<string, { totalLeads: number; conversions: number; lastConversion: string | null; earnings: number }>);

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
                  <TableHead>Campaign</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Last Conversion</TableHead>
                  <TableHead>Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(campaignStats).length > 0 ? (
                  Object.entries(campaignStats).map(([campaign, stats]) => (
                    <TableRow key={campaign}>
                      <TableCell>{campaign}</TableCell>
                      <TableCell>{stats.totalLeads}</TableCell>
                      <TableCell>{stats.conversions}</TableCell>
                      <TableCell>
                        {stats.lastConversion 
                          ? format(new Date(stats.lastConversion), 'MMM d, yyyy HH:mm:ss')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>${stats.earnings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
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