import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Reports() {
  const [dateRange, setDateRange] = useState("01/19/2025 - 01/19/2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");

  return (
    <DashboardLayout>
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Campaigns Report</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-[300px]"
            />
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
            <Button className="bg-green-600 hover:bg-green-700 ml-auto">
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No matching records found
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0.00%</TableCell>
                  <TableCell>$0.00</TableCell>
                  <TableCell>$0.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Customized Columns</span>
              <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute right-0 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Filtering</span>
              <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute right-0 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}