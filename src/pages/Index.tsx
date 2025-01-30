import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Star, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OfferList } from "@/components/offers/OfferList";
import { ClickStats } from "@/components/analytics/ClickStats";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  links?: string[];
  creatives?: {
    type: "image" | "email";
    content: string;
    details?: {
      fromNames?: string[];
      subjects?: string[];
    };
    images?: string[];
  }[];
}

interface DashboardStats {
  totalLeads: number;
  totalEarnings: number;
  conversionRate: number;
  totalClicks: number;
  recentLeads: Array<{
    date: string;
    count: number;
  }>;
}

export default function Index() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalEarnings: 0,
    conversionRate: 0,
    totalClicks: 0,
    recentLeads: []
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
    fetchOffers();
    fetchDashboardStats();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching top offers for affiliate dashboard...");
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .eq('is_top_offer', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }

      console.log("Fetched top offers:", data);
      
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || []
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*, offers(payout)')
        .eq('affiliate_id', user.id);

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        throw leadsError;
      }

      // Fetch clicks
      const { data: clicksData, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id);

      if (clicksError) {
        console.error("Error fetching clicks:", clicksError);
        throw clicksError;
      }

      console.log("Fetched leads:", leadsData);
      console.log("Fetched clicks:", clicksData);

      const totalLeads = leadsData?.length || 0;
      const totalClicks = clicksData?.length || 0;
      const totalEarnings = leadsData?.reduce((sum, lead) => sum + (lead.offers?.payout || 0), 0) || 0;
      const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalClicks > 0 ? (convertedLeads / totalClicks) * 100 : 0;

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

      setStats({
        totalLeads,
        totalEarnings,
        conversionRate,
        totalClicks,
        recentLeads
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 w-full px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Your Dashboard</h1>
          <p className="text-white/80">Track your performance and manage your campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-white">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLeads}</div>
              <p className="text-xs text-white/80 mt-1">Total leads generated</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-white">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalClicks}</div>
              <p className="text-xs text-white/80 mt-1">Total clicks tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-white">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-white/80 mt-1">Clicks to conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-white/80 mt-1">Total revenue earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Click Statistics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Click Statistics</h2>
          <ClickStats affiliateId={currentUserId} />
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Leads Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recentLeads}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="date" stroke="#fff" opacity={0.7} />
                  <YAxis stroke="#fff" opacity={0.7} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#9b87f5" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Offers */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-purple-300" />
            <h2 className="text-2xl font-bold text-white">Top Offers</h2>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            {offers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/80">No top offers available at the moment.</p>
              </div>
            ) : (
              <OfferList
                offers={offers}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleStatus={() => {}}
                isAdmin={false}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
