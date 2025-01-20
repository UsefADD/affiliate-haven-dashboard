import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  payout: z.number().min(0, "Payout must be a positive number"),
});

export type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  initialData?: OfferFormData;
  onSubmit: (data: OfferFormData) => void;
  isSubmitting?: boolean;
}

export function OfferForm({ initialData, onSubmit, isSubmitting }: OfferFormProps) {
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      payout: 0,
    },
  });

  return (
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Create'} Offer
        </Button>
      </form>
    </Form>
  );
}