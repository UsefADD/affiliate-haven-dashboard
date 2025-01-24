import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointer, TrendingUp } from "lucide-react";

interface ClickStats {
  totalClicks: number;
  clicksByDate: {
    date: string;
    count: number;
  }[];
}

export function ClickStats({ affiliateId }: { affiliateId?: string }) {
  const [stats, setStats] = useState<ClickStats>({
    totalClicks: 0,
    clicksByDate: []
  });

  useEffect(() => {
    fetchClickStats();
  }, [affiliateId]);

  const fetchClickStats = async () => {
    try {
      console.log("Fetching click statistics...");
      let query = supabase
        .from('affiliate_clicks')
        .select('*');

      // If affiliateId is provided, filter for specific affiliate
      if (affiliateId) {
        query = query.eq('affiliate_id', affiliateId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching click stats:', error);
        throw error;
      }

      console.log("Fetched click data:", data);

      // Process click data
      const clicksByDate = data.reduce((acc: any, click) => {
        const date = new Date(click.clicked_at).toLocaleDateString();
        const existingDate = acc.find((item: any) => item.date === date);
        
        if (existingDate) {
          existingDate.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        
        return acc;
      }, []);

      setStats({
        totalClicks: data.length,
        clicksByDate: clicksByDate.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      });

    } catch (error) {
      console.error('Error in fetchClickStats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
            <CardTitle className="text-sm font-medium">Click Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}