import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { OfferList } from "@/components/offers/OfferList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    recentLeads: []
  });

  useEffect(() => {
    fetchOffers();
    fetchDashboardStats();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers for affiliate dashboard...");
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }

      console.log("Fetched offers:", data);
      
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
      // Fetch total leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('affiliate_id', (await supabase.auth.getUser()).data.user?.id);

      if (leadsError) throw leadsError;

      // Calculate stats
      const totalLeads = leadsData?.length || 0;
      const totalEarnings = leadsData?.reduce((sum, lead) => sum + (lead.payout || 0), 0) || 0;
      const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads ? (convertedLeads / totalLeads) * 100 : 0;

      // Group leads by date for the chart
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
        recentLeads
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recentLeads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Available Offers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Offers</h2>
          {offers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No active offers available at the moment.</p>
            </div>
          ) : (
            <OfferList
              offers={offers}
              onEdit={() => {}}
              onToggleStatus={() => {}}
              isAdmin={false}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}