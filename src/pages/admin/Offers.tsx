import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
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
  links?: string[];
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
      
      // Convert the database response to match our Offer type
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
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
            links: values.links,
            creatives: values.creatives,
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
            links: values.links,
            creatives: values.creatives,
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

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: !currentStatus })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer status updated",
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsOpen(true);
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
                  links: editingOffer.links || [],
                  creatives: editingOffer.creatives || [],
                } : undefined}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        <OfferList
          offers={offers}
          onEdit={handleEdit}
          onToggleStatus={toggleOfferStatus}
        />
      </div>
    </DashboardLayout>
  );
}