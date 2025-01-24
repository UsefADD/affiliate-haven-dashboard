import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClickStats {
  affiliate_id: string;
  total_clicks: number;
  affiliate_name: string;
  daily_stats: {
    date: string;
    clicks: number;
  }[];
}

export function ClicksOverview() {
  const [clickStats, setClickStats] = useState<ClickStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClickStats();
  }, []);

  const fetchClickStats = async () => {
    try {
      // Fetch clicks grouped by affiliate
      const { data: affiliateStats, error: statsError } = await supabase
        .from('affiliate_clicks')
        .select(`
          affiliate_id,
          profiles!affiliate_clicks_affiliate_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('clicked_at', { ascending: false });

      if (statsError) throw statsError;

      // Process the data
      const processedStats: Record<string, ClickStats> = {};
      
      affiliateStats?.forEach(click => {
        const affiliateId = click.affiliate_id;
        const profile = click.profiles;
        
        if (!processedStats[affiliateId]) {
          processedStats[affiliateId] = {
            affiliate_id: affiliateId,
            total_clicks: 0,
            affiliate_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
            daily_stats: []
          };
        }
        
        processedStats[affiliateId].total_clicks++;
      });

      setClickStats(Object.values(processedStats));
    } catch (error) {
      console.error('Error fetching click stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Click Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Total Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clickStats.map((stat) => (
                <TableRow key={stat.affiliate_id}>
                  <TableCell>{stat.affiliate_name}</TableCell>
                  <TableCell>{stat.total_clicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}