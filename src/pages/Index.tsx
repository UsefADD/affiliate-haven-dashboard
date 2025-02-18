
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, MousePointer, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClickStats } from "@/components/analytics/ClickStats";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  totalClicks: number;
  totalLeads: number;
  totalEarnings: number;
  monthlyClicks: number;
  monthlyLeads: number;
  monthlyEarnings: number;
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    totalLeads: 0,
    totalEarnings: 0,
    monthlyClicks: 0,
    monthlyLeads: 0,
    monthlyEarnings: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      // Get monthly date range
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch all clicks
      const { data: allClicks, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id);

      if (clicksError) throw clicksError;

      // Fetch monthly clicks
      const { data: monthlyClicks, error: monthlyClicksError } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id)
        .gte('clicked_at', monthStart.toISOString())
        .lte('clicked_at', monthEnd.toISOString());

      if (monthlyClicksError) throw monthlyClicksError;

      // Fetch all leads with their stored payouts
      const { data: allLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*, offers(name)')
        .eq('affiliate_id', user.id)
        .eq('status', 'converted');

      if (leadsError) throw leadsError;

      // Fetch monthly leads
      const { data: monthlyLeads, error: monthlyLeadsError } = await supabase
        .from('leads')
        .select('*, offers(name)')
        .eq('affiliate_id', user.id)
        .eq('status', 'converted')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (monthlyLeadsError) throw monthlyLeadsError;

      // Calculate total earnings using stored payout values
      const totalEarnings = (allLeads || []).reduce((sum, lead) => 
        sum + Number(lead.payout), 0
      );

      // Calculate monthly earnings using stored payout values
      const monthlyEarnings = (monthlyLeads || []).reduce((sum, lead) => 
        sum + Number(lead.payout), 0
      );

      console.log("Dashboard Stats:", {
        totalClicks: allClicks?.length || 0,
        totalLeads: allLeads?.length || 0,
        totalEarnings,
        monthlyClicks: monthlyClicks?.length || 0,
        monthlyLeads: monthlyLeads?.length || 0,
        monthlyEarnings
      });

      setStats({
        totalClicks: allClicks?.length || 0,
        totalLeads: allLeads?.length || 0,
        totalEarnings,
        monthlyClicks: monthlyClicks?.length || 0,
        monthlyLeads: monthlyLeads?.length || 0,
        monthlyEarnings
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">All time clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">All time converted leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          {/* Monthly Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyClicks}</div>
              <p className="text-xs text-muted-foreground">This month's clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyLeads}</div>
              <p className="text-xs text-muted-foreground">This month's converted leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month's earnings</p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Click Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ClickStats />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
