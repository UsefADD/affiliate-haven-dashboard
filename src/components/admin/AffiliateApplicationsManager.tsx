
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AffiliateApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  status: string;
  created_at: string;
  phone: string;
  address: string;
  apt_suite: string | null;
  city: string;
  state: string;
  zip_postal: string;
  country: string;
  telegram: string;
  im: string | null;
  im_type: string | null;
  title: string | null;
  website_url: string | null;
  payment_method: string;
  pay_to: string;
  marketing_comments: string | null;
  site_marketing: string | null;
  known_contacts: string;
  current_advertisers: string;
}

export function AffiliateApplicationsManager() {
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);
      console.log(`Processing application ${id} with status ${newStatus}`);

      const { error } = await supabase.functions.invoke('handle-application-status', {
        body: { applicationId: id, status: newStatus },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${newStatus} successfully`,
      });

      // Remove the processed application from the list
      setApplications(prev => prev.filter(app => app.id !== id));
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: `Failed to ${newStatus} application. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <>
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {selectedApplication && (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Personal Information</h3>
                    <p><span className="font-medium">Name:</span> {selectedApplication.first_name} {selectedApplication.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                    <p><span className="font-medium">Company:</span> {selectedApplication.company || 'N/A'}</p>
                    <p><span className="font-medium">Title:</span> {selectedApplication.title || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact Details</h3>
                    <p><span className="font-medium">Telegram:</span> {selectedApplication.telegram}</p>
                    <p><span className="font-medium">IM:</span> {selectedApplication.im || 'N/A'}</p>
                    <p><span className="font-medium">IM Type:</span> {selectedApplication.im_type || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p>{selectedApplication.address}</p>
                  {selectedApplication.apt_suite && <p>Apt/Suite: {selectedApplication.apt_suite}</p>}
                  <p>{selectedApplication.city}, {selectedApplication.state} {selectedApplication.zip_postal}</p>
                  <p>{selectedApplication.country}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Business Information</h3>
                  <p><span className="font-medium">Website:</span> {selectedApplication.website_url || 'N/A'}</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedApplication.payment_method}</p>
                  <p><span className="font-medium">Pay To:</span> {selectedApplication.pay_to}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Additional Information</h3>
                  <p><span className="font-medium">Known Contacts:</span> {selectedApplication.known_contacts}</p>
                  <p><span className="font-medium">Current Advertisers:</span> {selectedApplication.current_advertisers}</p>
                  {selectedApplication.marketing_comments && (
                    <p><span className="font-medium">Marketing Comments:</span> {selectedApplication.marketing_comments}</p>
                  )}
                  {selectedApplication.site_marketing && (
                    <p><span className="font-medium">Site Marketing:</span> {selectedApplication.site_marketing}</p>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
          {selectedApplication?.status === 'pending' && (
            <div className="flex justify-end space-x-2 mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isProcessing}>
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reject the application and send a rejection email to the applicant. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will approve the application, create a user account, and send login credentials to the applicant. Would you like to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(app)}
                            >
                              View Details
                            </Button>
                            {app.status === 'pending' && !isProcessing && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusUpdate(app.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(app.id, 'rejected')}
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
    </>
  );
}
