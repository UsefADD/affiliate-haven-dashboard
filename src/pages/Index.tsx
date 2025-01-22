import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import OfferList from "@/components/offers/OfferList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Star, MousePointerClick } from "lucide-react";
import { Offer } from "@/types/offer";

interface DashboardStats {
  totalLeads: number;
  totalEarnings: number;
  conversionRate: number;
  totalClicks: number;
  recentLeads: Array<{
    date: string;
    count: number;
  }>;
  recentClicks: Array<{
    date: string;
    count: number;
  }>;
}

export default function Index() {
  console.log("Index component mounted");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalEarnings: 0,
    conversionRate: 0,
    totalClicks: 0,
    recentLeads: [],
    recentClicks: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Authentication error");
          return;
        }

        if (!session) {
          console.log("No active session found");
          setError("No active session");
          return;
        }

        console.log("Session found:", session.user.id);
        fetchOffers();
        fetchDashboardStats();
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Authentication check failed");
      }
    };

    checkAuth();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching top offers for affiliate dashboard...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .eq('is_top_offer', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        setError("Error fetching offers");
        throw error;
      }

      console.log("Fetched top offers:", data);
      
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
        created_by: offer.created_by || user.id,
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || []
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
      setError("Failed to fetch offers");
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Fetch leads data
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('affiliate_id', user.id);

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        setError("Error fetching leads");
        throw leadsError;
      }

      // Fetch clicks data
      const { data: clicksData, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id);

      if (clicksError) {
        console.error("Error fetching clicks:", clicksError);
        setError("Error fetching clicks");
        throw clicksError;
      }

      console.log("Fetched leads:", leadsData);
      console.log("Fetched clicks:", clicksData);

      const totalLeads = leadsData?.length || 0;
      const totalClicks = clicksData?.length || 0;
      const totalEarnings = leadsData?.reduce((sum, lead) => sum + (lead.payout || 0), 0) || 0;
      const conversionRate = totalClicks ? (totalLeads / totalClicks) * 100 : 0;

      // Process recent leads data
      const recentLeads = leadsData?.reduce((acc: any[], lead) => {
        const date = new Date(lead.created_at).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
          existingDate.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7) || [];

      // Process recent clicks data
      const recentClicks = clicksData?.reduce((acc: any[], click) => {
        const date = new Date(click.clicked_at).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
          existingDate.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7) || [];

      setStats({
        totalLeads,
        totalEarnings,
        conversionRate,
        totalClicks,
        recentLeads,
        recentClicks
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError("Failed to fetch dashboard stats");
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-600">Please try refreshing the page or logging in again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-green-100">Track your performance and manage your campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">Total leads generated</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">Total clicks tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total revenue earned</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Leads per click</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Leads Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border border-green-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-600">Recent Leads Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.recentLeads}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#059669" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Clicks Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border border-green-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-600">Recent Clicks Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.recentClicks}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#059669" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Offers */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-green-600">Top Offers</h2>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border border-green-100">
            <CardContent className="p-6">
              {offers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No top offers available at the moment.</p>
                </div>
              ) : (
                <OfferList
                  offers={offers}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onToggleStatus={async () => {}}
                  isAdmin={false}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}