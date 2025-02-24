import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { OfferList } from "@/components/offers/OfferList";
import { ClickStats } from "@/components/analytics/ClickStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Star, MousePointer, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth } from "date-fns";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  created_by: string;
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
  is_top_offer: boolean;
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
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        setCurrentUserId(session.user.id);
        if (session.user.id) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error: any) {
        console.error('Session check error:', error);
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkSession();
    fetchOffers();
    fetchDashboardStats();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      console.log("Profile data:", existingProfile);

      if (!existingProfile) {
        console.log("No profile found, creating new profile...");
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId,
            role: 'affiliate',
            email: (await supabase.auth.getUser()).data.user?.email,
            first_name: '', 
            last_name: ''
          }])
          .select('*')
          .maybeSingle();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        
        if (!newProfile) {
          throw new Error('Failed to create new profile');
        }

        console.log("New profile created:", newProfile);
        setProfile(newProfile);
        return;
      }

      console.log("Existing profile found:", existingProfile);
      setProfile(existingProfile);
    } catch (error: any) {
      console.error('Profile fetch/create error:', error);
      toast({
        title: "Error",
        description: "Failed to load or create user profile",
        variant: "destructive",
      });
    }
  };

  const fetchOffers = async () => {
    try {
      console.log("Fetching top offers for affiliate dashboard...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        return;
      }

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
        id: offer.id,
        name: offer.name,
        description: offer.description,
        payout: offer.payout,
        status: offer.status || false,
        created_at: offer.created_at,
        created_by: offer.created_by || user.id,
        creatives: Array.isArray(offer.creatives) 
          ? offer.creatives.map((creative: any) => {
              if (typeof creative === 'object' && creative !== null) {
                const type = creative.type === "email" ? "email" as const : "image" as const;
                return {
                  type,
                  content: String(creative.content || ""),
                  details: {
                    fromNames: Array.isArray(creative.details?.fromNames) ? creative.details.fromNames : [],
                    subjects: Array.isArray(creative.details?.subjects) ? creative.details.subjects : []
                  },
                  images: Array.isArray(creative.images) ? creative.images : []
                };
              }
              return null;
            }).filter((c): c is NonNullable<typeof c> => c !== null)
          : [],
        links: Array.isArray(offer.links) ? offer.links : [],
        is_top_offer: offer.is_top_offer || false,
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats for current month...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          offers (
            id,
            name,
            payout
          )
        `)
        .eq('affiliate_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        throw leadsError;
      }

      const { data: clicksData, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('affiliate_id', user.id)
        .gte('clicked_at', monthStart.toISOString())
        .lte('clicked_at', monthEnd.toISOString());

      if (clicksError) {
        console.error("Error fetching clicks:", clicksError);
        throw clicksError;
      }

      console.log("Fetched current month leads:", leadsData);
      console.log("Fetched current month clicks:", clicksData);

      const totalLeads = leadsData?.length || 0;
      const totalClicks = clicksData?.length || 0;
      
      const totalEarnings = leadsData
        ?.filter(lead => lead.status === 'converted')
        .reduce((sum, lead) => {
          const leadPayout = Number(lead.payout) || 0;
          console.log(`Processing lead earnings:`, {
            leadId: lead.id,
            payout: leadPayout,
            isVariable: lead.variable_payout
          });
          return sum + leadPayout;
        }, 0) || 0;

      const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalClicks > 0 ? (convertedLeads / totalClicks) * 100 : 0;

      const recentLeads = leadsData
        ?.reduce((acc: any[], lead) => {
          const date = new Date(lead.created_at).toLocaleDateString();
          const existingDate = acc.find(item => item.date === date);
          if (existingDate) {
            existingDate.count++;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

      setStats({
        totalLeads,
        totalEarnings,
        conversionRate,
        totalClicks,
        recentLeads
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome{profile?.first_name || profile?.last_name ? `, ${[profile.first_name, profile.last_name].filter(Boolean).join(' ')}` : ''}
          </h1>
          <p className="text-green-100">Maximize Your Performance & Grow Your Earnings</p>
          <div className="mt-4 space-y-4">
            <p className="text-green-100 leading-relaxed">
              Stay informed about exclusive offers, promotions, and important updates to help you succeed.
            </p>
            <div className="flex items-center space-x-2 text-green-100 bg-green-700/50 p-4 rounded-lg">
              <MessageSquare className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  📢 Don't miss out! Join our Telegram channel for the latest updates, special deals, and insider tips:{" "}
                  <Button 
                    variant="link" 
                    className="text-white hover:text-green-200 p-0 h-auto font-semibold"
                    onClick={() => window.open("https://t.me/+unqHkAExGpM1MzY8", "_blank")}
                  >
                    Click here to join
                  </Button>
                </p>
              </div>
            </div>
          </div>
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
              <MousePointer className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">Total clicks tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Clicks to conversions</p>
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
        </div>

        {/* Click Statistics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-600">Click Statistics</h2>
          <ClickStats affiliateId={currentUserId} />
        </div>

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
                  onToggleStatus={() => {}}
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
