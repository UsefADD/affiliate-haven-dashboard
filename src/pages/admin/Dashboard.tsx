import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Users, Gift, FileSpreadsheet, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { AffiliateApplicationsManager } from "@/components/admin/AffiliateApplicationsManager";
import { ClicksOverview } from "@/components/admin/ClicksOverview";
import { AffiliatePerformanceDashboard } from "@/components/admin/AffiliatePerformanceDashboard";

interface DashboardStats {
  totalOffers: number;
  totalAffiliates: number;
  totalLeads: number;
  activeOffers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOffers: 0,
    totalAffiliates: 0,
    totalLeads: 0,
    activeOffers: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats...");
      
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('status');
      
      if (offersError) throw offersError;

      const { data: affiliates, error: affiliatesError } = await supabase
        .from('profiles')
        .select('role')
        .eq('role', 'affiliate');
      
      if (affiliatesError) throw affiliatesError;

      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id');
      
      if (leadsError) throw leadsError;

      setStats({
        totalOffers: offers?.length || 0,
        activeOffers: offers?.filter(offer => offer.status)?.length || 0,
        totalAffiliates: affiliates?.length || 0,
        totalLeads: leads?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    }
  };

  const cards = [
    {
      title: "Total Offers",
      value: stats.totalOffers,
      description: `${stats.activeOffers} active`,
      icon: Gift,
      link: "/admin/offers",
      color: "bg-purple-500"
    },
    {
      title: "Total Affiliates",
      value: stats.totalAffiliates,
      description: "Registered affiliates",
      icon: Users,
      link: "/admin/users",
      color: "bg-blue-500"
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      description: "All time leads",
      icon: FileSpreadsheet,
      link: "/admin/leads",
      color: "bg-orange-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white mb-8">
          <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/80">Manage your affiliate network and track performance</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <Link key={index} to={card.link} className="block transform hover:scale-105 transition-all duration-300">
              <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
                <div className={`absolute inset-0 opacity-10 ${card.color}`}></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.color} bg-opacity-20`}>
                    <card.icon className={`h-5 w-5 ${card.color} text-white`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold mb-1">{card.value}</div>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Affiliate Performance Dashboard */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-lg p-6">
          <AffiliatePerformanceDashboard />
        </div>

        {/* Click Statistics Section */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Click Statistics</h2>
          </div>
          <ClicksOverview />
        </div>

        {/* Applications Section */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Recent Applications</h2>
          </div>
          <AffiliateApplicationsManager />
        </div>
      </div>
    </DashboardLayout>
  );
}