
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OfferForm, OfferFormData } from "@/components/offers/OfferForm";
import { OfferList } from "@/components/offers/OfferList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Offer } from "@/types/offer";

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }
      
      console.log("Fetched offers:", data);
      if (!data) {
        setOffers([]);
        return;
      }

      const typedOffers: Offer[] = data.map(offer => ({
        id: offer.id,
        name: offer.name,
        description: offer.description || '',
        payout: offer.payout,
        status: offer.status ?? true,
        created_at: offer.created_at,
        created_by: offer.created_by,
        creatives: (offer.creatives as Offer['creatives']) || [],
        links: offer.links || [],
        is_top_offer: offer.is_top_offer || false
      }));
      
      console.log("Processed offers:", typedOffers);
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
        setDeleteError("Cannot delete this offer because it has associated leads.");
        return;
      }

      // Check for affiliate clicks
      const { data: clicks, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('id')
        .eq('offer_id', offerToDelete.id)
        .limit(1);

      if (clicksError) throw clicksError;

      if (clicks && clicks.length > 0) {
        setDeleteError("Cannot delete this offer because it has associated clicks.");
        return;
      }

      // If no related data, proceed with deletion
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

        {offers && offers.length > 0 ? (
          <OfferList
            offers={offers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onToggleTopOffer={handleToggleTopOffer}
            isAdmin={true}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No offers found. Create your first offer!</p>
          </div>
        )}

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
