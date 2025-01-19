import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, DollarSign, Users, Link as LinkIcon } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

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
      </div>
    </DashboardLayout>
  );
}