import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AffiliateApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  status: string;
  created_at: string;
}

export function AffiliateApplicationsManager() {
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log("Fetching affiliate applications...");
      const { data, error } = await supabase
        .from('affiliate_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched applications:", data);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliate applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      console.log(`Updating application ${id} status to ${newStatus}`);
      const { error } = await supabase
        .from('affiliate_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading applications...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        {format(new Date(app.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {app.first_name} {app.last_name}
                      </TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.company || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateApplicationStatus(app.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateApplicationStatus(app.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}