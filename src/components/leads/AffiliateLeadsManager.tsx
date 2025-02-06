import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LeadForm, LeadFormData } from "@/components/leads/LeadForm";
import { LeadList } from "@/components/leads/LeadList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Offer {
  id: string;
  name: string;
  payout: number;
  status: boolean;
}

interface Lead {
  id: string;
  affiliate_id: string;
  offer_id: string;
  status: string;
  created_at: string;
  conversion_date: string | null;
  payout: number;
  variable_payout: boolean;
  affiliate: {
    first_name: string | null;
    last_name: string | null;
  };
  offer: {
    name: string;
  };
}

export function AffiliateLeadsManager() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [affiliates, setAffiliates] = useState<Profile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
    fetchOffers();
  }, []);

  useEffect(() => {
    if (selectedAffiliate) {
      fetchAffiliateLeads(selectedAffiliate);
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

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers...");
      const { data, error } = await supabase
        .from('offers')
        .select('id, name, payout, status')
        .eq('status', true);

      if (error) throw error;

      console.log("Fetched offers:", data);
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
    }
  };

  const fetchAffiliateLeads = async (affiliateId: string) => {
    try {
      console.log("Fetching leads for affiliate:", affiliateId);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          affiliate:profiles!leads_affiliate_id_fkey (
            first_name,
            last_name
          ),
          offer:offers!leads_offer_id_fkey (
            name
          )
        `)
        .eq('affiliate_id', affiliateId);

      if (error) throw error;

      console.log("Fetched leads:", data);
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (values: LeadFormData) => {
    if (!selectedAffiliate) return;

    try {
      setIsSubmitting(true);
      console.log("Creating/updating lead with values:", values);

      if (editingLead) {
        const updateData: any = {
          status: values.status,
          payout: values.payout,
          offer_id: values.offer_id,
          variable_payout: values.variable_payout,
        };

        if (values.status === 'converted' && editingLead.status !== 'converted') {
          updateData.conversion_date = new Date().toISOString();
        } else if (values.status !== 'converted') {
          updateData.conversion_date = null;
        }

        const { error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', editingLead.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('leads')
          .insert({
            affiliate_id: selectedAffiliate,
            offer_id: values.offer_id,
            status: values.status,
            payout: values.payout,
            variable_payout: values.variable_payout,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lead created successfully",
        });
      }
      
      setIsOpen(false);
      setEditingLead(null);
      fetchAffiliateLeads(selectedAffiliate);
    } catch (error) {
      console.error('Error creating/updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsOpen(true);
  };

  const toggleLeadStatus = async (leadId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'converted' ? 'pending' : 'converted';
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'converted') {
        updateData.conversion_date = new Date().toISOString();
      } else {
        updateData.conversion_date = null;
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead status updated",
      });
      
      if (selectedAffiliate) {
        fetchAffiliateLeads(selectedAffiliate);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;

    try {
      console.log("Deleting lead:", leadToDelete.id);
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });

      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      if (selectedAffiliate) {
        fetchAffiliateLeads(selectedAffiliate);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Leads Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center space-x-4">
            <Select
              value={selectedAffiliate || ""}
              onValueChange={(value) => setSelectedAffiliate(value)}
            >
              <SelectTrigger className="w-full">
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

            {selectedAffiliate && (
              <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingLead(null);
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingLead ? 'Edit' : 'Add'} Lead</DialogTitle>
                  </DialogHeader>
                  <LeadForm
                    initialData={editingLead ? {
                      status: editingLead.status,
                      payout: editingLead.payout,
                      offer_id: editingLead.offer_id,
                      variable_payout: editingLead.variable_payout,
                    } : undefined}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    offers={offers}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAffiliate && (
        <>
          <LeadList
            leads={leads}
            onEdit={handleEdit}
            onToggleStatus={toggleLeadStatus}
            onDelete={handleDelete}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the lead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
