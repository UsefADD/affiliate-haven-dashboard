import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, LineChart } from "recharts";
import { ArrowUpRight, DollarSign, Users, Link as LinkIcon } from "lucide-react";

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

const chartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 700 },
];

export default function Index() {
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

        {/* Charts */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
            <div className="h-[300px]">
              {/* Add chart component here */}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
            <div className="h-[300px]">
              {/* Add chart component here */}
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}