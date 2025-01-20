import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Users, Gift, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

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
      // Fetch total offers and active offers
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('status');
      
      if (offersError) throw offersError;

      // Fetch total affiliates (users with affiliate role)
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('profiles')
        .select('role')
        .eq('role', 'affiliate');
      
      if (affiliatesError) throw affiliatesError;

      // Fetch total leads
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
      link: "/admin/offers"
    },
    {
      title: "Total Affiliates",
      value: stats.totalAffiliates,
      description: "Registered affiliates",
      icon: Users,
      link: "/admin/users"
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      description: "All time leads",
      icon: FileSpreadsheet,
      link: "/admin/leads"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <Link key={index} to={card.link} className="block">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}