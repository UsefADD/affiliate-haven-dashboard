
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LeadForm, LeadFormData } from "@/components/leads/LeadForm";
import { LeadList } from "@/components/leads/LeadList";

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

interface Offer {
  id: string;
  name: string;
  payout: number;
  status: boolean;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers...");
      const { data, error } = await supabase
        .from('offers')
        .select('id, name, payout, status')
        .eq('status', true);

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }
      
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

  const fetchLeads = async () => {
    try {
      console.log("Fetching leads...");
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          affiliate_id,
          offer_id,
          status,
          created_at,
          conversion_date,
          payout,
          variable_payout,
          affiliate:profiles!leads_affiliate_id_fkey (
            first_name,
            last_name
          ),
          offer:offers!leads_offer_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        throw error;
      }
      
      console.log("Fetched leads:", data);
      const typedLeads = data?.map(lead => ({
        ...lead,
        affiliate: {
          first_name: lead.affiliate?.first_name || null,
          last_name: lead.affiliate?.last_name || null
        },
        offer: {
          name: lead.offer?.name || 'Unknown Offer'
        }
      })) as Lead[];
      
      setLeads(typedLeads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: LeadFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Updating lead with values:", values);

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
      }
      
      setIsOpen(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsOpen(true);
  };

  const handleDelete = async (lead: Lead) => {
    try {
      console.log("Deleting lead:", lead.id);
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      
      fetchLeads();
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Lead Management</h1>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingLead(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <LeadForm
              initialData={editingLead ? {
                status: editingLead.status,
                payout: editingLead.payout,
                offer_id: editingLead.offer_id,
                variable_payout: editingLead.variable_payout,
              } : undefined}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              offers={offers}
            />
          </DialogContent>
        </Dialog>

        <LeadList
          leads={leads}
          onEdit={handleEdit}
          onToggleStatus={toggleLeadStatus}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
