import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClickData {
  id: string;
  clicked_at: string;
  ip_address: string;
  user_agent: string;
  referrer: string;
  affiliate: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  offer: {
    name: string;
  };
}

export default function Clicks() {
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchClicks();
  }, []);

  const checkAdminAndFetchClicks = async () => {
    try {
      console.log("Checking admin status and fetching clicks...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (profile?.role !== 'admin') {
        console.log("User is not admin, redirecting to home");
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You need admin privileges to view this page",
          variant: "destructive",
        });
        return;
      }

      setIsAdmin(true);
      await fetchClicks();
      
    } catch (error) {
      console.error('Error in admin check:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  const fetchClicks = async () => {
    try {
      console.log("Fetching clicks data...");
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select(`
          *,
          affiliate:profiles!affiliate_clicks_affiliate_id_fkey (
            first_name,
            last_name,
            email
          ),
          offer:offers!affiliate_clicks_offer_id_fkey (
            name
          )
        `)
        .order('clicked_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched clicks:", data);
      setClicks(data || []);
    } catch (error) {
      console.error('Error fetching clicks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clicks data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading clicks data...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Offer</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Referrer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell>
                          {format(new Date(click.clicked_at), 'MMM d, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          {click.affiliate?.first_name} {click.affiliate?.last_name}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {click.affiliate?.email}
                          </span>
                        </TableCell>
                        <TableCell>{click.offer?.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {click.ip_address}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {click.referrer || 'Direct'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {clicks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No clicks recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}