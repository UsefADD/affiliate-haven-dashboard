import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Reports() {
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const { toast } = useToast();

  const handleRunReport = () => {
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date to run the report",
        variant: "destructive",
      });
      return;
    }

    // This is where you would typically fetch data from your backend
    // For now, we'll simulate some data based on the selected date
    const mockData = [
      {
        id: "1",
        campaignName: `Campaign for ${format(date, "MMM d, yyyy")}`,
        clicks: 150,
        sales: 12,
        conversion: "8.00",
        epc: "2.50",
        earnings: "375.00"
      }
    ];

    setReportData(mockData);
    toast({
      title: "Report Generated",
      description: `Showing results for ${format(date, "MMM d, yyyy")}`,
    });
  };

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
                <SelectValue placeholder="Filter by Category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="display">Display</SelectItem>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Conv</TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  <>
                    {reportData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.campaignName}</TableCell>
                        <TableCell>{row.clicks}</TableCell>
                        <TableCell>{row.sales}</TableCell>
                        <TableCell>{row.conversion}%</TableCell>
                        <TableCell>${row.epc}</TableCell>
                        <TableCell>${row.earnings}</TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell>{reportData.reduce((sum, row) => sum + row.clicks, 0)}</TableCell>
                  <TableCell>{reportData.reduce((sum, row) => sum + row.sales, 0)}</TableCell>
                  <TableCell>
                    {(reportData.reduce((sum, row) => sum + parseFloat(row.conversion), 0) / Math.max(reportData.length, 1)).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    ${(reportData.reduce((sum, row) => sum + parseFloat(row.epc), 0) / Math.max(reportData.length, 1)).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${reportData.reduce((sum, row) => sum + parseFloat(row.earnings), 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}