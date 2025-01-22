import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OfferForm, OfferFormData } from "@/components/offers/OfferForm";
import OfferList from "@/components/offers/OfferList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
  links?: string[];
  is_top_offer?: boolean;
  creatives?: {
    type: "image" | "email";
    content: string;
    details?: {
      fromNames?: string[];
      subjects?: string[];
    };
    images?: string[];
  }[];
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }
      
      console.log("Fetched offers:", data);
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
        created_by: offer.created_by || user.id, // Ensure created_by is always set
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || []
      }));
      
      setOffers(typedOffers);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Creating/updating offer with values:", values);

      if (editingOffer) {
        const { error } = await supabase
          .from('offers')
          .update({
            name: values.name,
            description: values.description,
            payout: values.payout,
            status: values.status,
            links: values.links,
            creatives: values.creatives,
            is_top_offer: values.is_top_offer,
          })
          .eq('id', editingOffer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('offers')
          .insert({
            name: values.name,
            description: values.description,
            payout: values.payout,
            status: values.status,
            links: values.links,
            creatives: values.creatives,
            is_top_offer: values.is_top_offer,
            created_by: user.id,
          });

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
      console.error('Error creating/updating offer:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingOffer ? 'update' : 'create'} offer`,
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
    setOfferToDelete(offer);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;

    try {
      // First check if the offer has any leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id')
        .eq('offer_id', offerToDelete.id)
        .limit(1);

      if (leadsError) throw leadsError;

      if (leads && leads.length > 0) {
        setDeleteError("Cannot delete this offer because it has associated leads. Please delete the leads first.");
        return;
      }

      // If no leads, proceed with deletion
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });

      setDeleteDialogOpen(false);
      setOfferToDelete(null);
      setDeleteError(null);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setDeleteError("Failed to delete offer. Please try again.");
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
        description: `Offer ${!currentTopStatus ? 'marked as top' : 'removed from top offers'} successfully`,
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
          <h1 className="text-3xl font-bold">Offers Management</h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingOffer(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit' : 'Create New'} Offer</DialogTitle>
              </DialogHeader>
              <OfferForm
                initialData={editingOffer ? {
                  name: editingOffer.name,
                  description: editingOffer.description || '',
                  payout: editingOffer.payout,
                  status: editingOffer.status,
                  links: editingOffer.links || [],
                  creatives: editingOffer.creatives || [],
                  is_top_offer: editingOffer.is_top_offer,
                } : undefined}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                isAdmin={true}
              />
            </DialogContent>
          </Dialog>
        </div>

        <OfferList
          offers={offers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onToggleTopOffer={handleToggleTopOffer}
          isAdmin={true}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                {deleteError ? (
                  <p className="text-red-500">{deleteError}</p>
                ) : (
                  <p>
                    This action cannot be undone. This will permanently delete the offer
                    "{offerToDelete?.name}" and remove all associated data.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteError(null);
                setDeleteDialogOpen(false);
              }}>
                Cancel
              </AlertDialogCancel>
              {!deleteError && (
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}