import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  payout: z.number().min(0, "Payout must be a positive number"),
});

interface Offer {
  id: string;
  name: string;
  description: string | null;
  payout: number;
  status: boolean;
  created_at: string;
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: "",
      description: "",
      payout: 0,
    },
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (editingOffer) {
      form.reset({
        name: editingOffer.name,
        description: editingOffer.description || "",
        payout: editingOffer.payout,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        payout: 0,
      });
    }
  }, [editingOffer, form]);

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

  const onSubmit = async (values: z.infer<typeof offerSchema>) => {
    try {
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
      form.reset();
      fetchOffers();
    } catch (error) {
      console.error('Error creating/updating offer:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingOffer ? 'update' : 'create'} offer`,
        variant: "destructive",
      });
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit' : 'Create New'} Offer</DialogTitle>
                <DialogDescription>
                  {editingOffer ? 'Update the offer details below.' : 'Fill in the offer details below.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Offer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Offer description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payout ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {editingOffer ? 'Update' : 'Create'} Offer
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>{offer.description || 'N/A'}</TableCell>
                  <TableCell>${offer.payout}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleOfferStatus(offer.id, offer.status)}
                    >
                      {offer.status ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(offer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}