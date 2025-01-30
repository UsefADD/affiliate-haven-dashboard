import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, MousePointer, TrendingUp, Users } from "lucide-react";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface AffiliateStats {
  totalClicks: number;
  totalLeads: number;
  totalEarnings: number;
  clicksByOffer: {
    offer_name: string;
    clicks: number;
  }[];
  leadsByOffer: {
    offer_name: string;
    leads: number;
    earnings: number;
  }[];
}

export function AffiliatePerformanceDashboard() {
  const [affiliates, setAffiliates] = useState<Profile[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("");
  const [stats, setStats] = useState<AffiliateStats>({
    totalClicks: 0,
    totalLeads: 0,
    totalEarnings: 0,
    clicksByOffer: [],
    leadsByOffer: []
  });
  const { toast } = useToast();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchAffiliates();
  }, []);

  useEffect(() => {
    if (selectedAffiliate) {
      fetchAffiliateStats(selectedAffiliate);
    }
  }, [selectedAffiliate]);

  const fetchAffiliates = async () => {
    try {
      console.log("Fetching affiliates...");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'affiliate');

      if (error) throw error;

      console.log("Fetched affiliates:", data);
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliates",
        variant: "destructive",
      });
    }
  };

  const fetchAffiliateStats = async (affiliateId: string) => {
    try {
      console.log("Fetching stats for affiliate:", affiliateId);
      
      // Fetch clicks
      const { data: clicks, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select(`
          *,
          offers (
            name,
            payout
          )
        `)
        .eq('affiliate_id', affiliateId);

      if (clicksError) throw clicksError;

      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          offers (
            name,
            payout
          )
        `)
        .eq('affiliate_id', affiliateId)
        .eq('status', 'converted');

      if (leadsError) throw leadsError;

      // Process clicks by offer
      const clicksByOffer = clicks?.reduce((acc: any, click) => {
        const offerName = click.offers?.name || 'Unknown';
        const existing = acc.find((item: any) => item.offer_name === offerName);
        
        if (existing) {
          existing.clicks++;
        } else {
          acc.push({ offer_name: offerName, clicks: 1 });
        }
        
        return acc;
      }, []) || [];

      // Process leads by offer
      const leadsByOffer = leads?.reduce((acc: any, lead) => {
        const offerName = lead.offers?.name || 'Unknown';
        const existing = acc.find((item: any) => item.offer_name === offerName);
        
        if (existing) {
          existing.leads++;
          existing.earnings += Number(lead.payout);
        } else {
          acc.push({ 
            offer_name: offerName, 
            leads: 1, 
            earnings: Number(lead.payout)
          });
        }
        
        return acc;
      }, []) || [];

      const totalEarnings = leads?.reduce((sum, lead) => sum + Number(lead.payout), 0) || 0;

      setStats({
        totalClicks: clicks?.length || 0,
        totalLeads: leads?.length || 0,
        totalEarnings,
        clicksByOffer,
        leadsByOffer
      });

    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliate statistics",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Affiliate Performance Dashboard</h2>
        <Select
          value={selectedAffiliate}
          onValueChange={setSelectedAffiliate}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select an affiliate" />
          </SelectTrigger>
          <SelectContent>
            {affiliates.map((affiliate) => (
              <SelectItem key={affiliate.id} value={affiliate.id}>
                {affiliate.first_name} {affiliate.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAffiliate && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Converted Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clicks by Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.clicksByOffer}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                      <XAxis dataKey="offer_name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings by Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.leadsByOffer}
                        dataKey="earnings"
                        nameKey="offer_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ offer_name, earnings }) => `${offer_name}: $${earnings}`}
                      >
                        {stats.leadsByOffer.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}