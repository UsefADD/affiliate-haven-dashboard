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
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  offer: {
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
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          status,
          created_at,
          conversion_date,
          offers (
            name,
            payout
          )
        `)
        .eq('affiliate_id', user.id);

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

    // Filter the existing data based on the selected date
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
  const totalLeads = reportData.length;
  const totalConversions = reportData.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads ? ((totalConversions / totalLeads) * 100).toFixed(2) : "0.00";
  const totalEarnings = reportData
    .filter(lead => lead.status === 'converted')
    .reduce((sum, lead) => sum + (lead.offer?.payout || 0), 0);
  const averageEPC = totalLeads ? (totalEarnings / totalLeads).toFixed(2) : "0.00";

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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Filter by Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-green-600 hover:bg-green-700 ml-auto"
              onClick={handleRunReport}
            >
              Run
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conversion Date</TableHead>
                  <TableHead>Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{format(new Date(lead.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{lead.offer?.name || 'N/A'}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>
                        {lead.conversion_date 
                          ? format(new Date(lead.conversion_date), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        ${lead.status === 'converted' ? lead.offer?.payout.toFixed(2) : '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell>{conversionRate}% Conv.</TableCell>
                  <TableCell>EPC: ${averageEPC}</TableCell>
                  <TableCell>${totalEarnings.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}