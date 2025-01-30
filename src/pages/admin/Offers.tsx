import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OfferForm, OfferFormData } from "@/components/offers/OfferForm";
import { OfferList } from "@/components/offers/OfferList";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  created_by: string;
  creatives: any | null;
  links: string[] | null;
  is_top_offer: boolean | null;
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers...");
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

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

  const onSubmit = async (values: OfferFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Updating offer with values:", values);

      const offerData = {
        name: values.name,
        description: values.description,
        payout: values.payout,
        status: values.status,
        creatives: values.creatives,
        links: values.links,
        is_top_offer: values.is_top_offer,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('offers')
          .update(offerData)
          .eq('id', editingOffer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('offers')
          .insert(offerData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      }
      
      setIsOpen(false);
      setEditingOffer(null);
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsOpen(true);
  };

  const handleDelete = async (offer: Offer) => {
    try {
      console.log("Deleting offer:", offer.id);
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: !currentStatus })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    }
  };

  const handleToggleTopOffer = async (offerId: string, currentTopStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_top_offer: !currentTopStatus })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Offer ${!currentTopStatus ? 'marked as top' : 'unmarked as top'} successfully`,
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error toggling top offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update top offer status",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Offer Management</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Create Offer
          </button>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingOffer(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOffer ? "Edit Offer" : "Create Offer"}</DialogTitle>
            </DialogHeader>
            <OfferForm
              initialData={editingOffer ? {
                name: editingOffer.name,
                description: editingOffer.description || "",
                payout: editingOffer.payout,
                status: editingOffer.status || false,
                creatives: editingOffer.creatives || [],
                links: editingOffer.links || [],
                is_top_offer: editingOffer.is_top_offer || false,
              } : undefined}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              isAdmin={true}
            />
          </DialogContent>
        </Dialog>

        <OfferList
          offers={offers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onToggleTopOffer={handleToggleTopOffer}
          isAdmin={true}
        />
      </div>
    </DashboardLayout>
  );
}