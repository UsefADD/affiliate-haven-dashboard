
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  status: z.string(),
  payout: z.number().min(0),
  offer_id: z.string().uuid(),
  variable_payout: z.boolean().default(false),
});

export type LeadFormData = z.infer<typeof formSchema>;

interface Offer {
  id: string;
  name: string;
  payout: number;
}

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  onSubmit: (values: LeadFormData) => void;
  isSubmitting: boolean;
  offers: Offer[];
}

export function LeadForm({ initialData, onSubmit, isSubmitting, offers }: LeadFormProps) {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: initialData?.status || 'pending',
      payout: initialData?.payout || 0,
      offer_id: initialData?.offer_id || '',
      variable_payout: initialData?.variable_payout || false,
    },
  });

  const handleOfferChange = (offerId: string) => {
    const selectedOffer = offers.find(offer => offer.id === offerId);
    if (selectedOffer) {
      if (selectedOffer.payout === 0) {
        form.setValue('variable_payout', true);
      } else {
        form.setValue('variable_payout', false);
        form.setValue('payout', selectedOffer.payout);
      }
    }
    form.setValue('offer_id', offerId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="offer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer</FormLabel>
              <Select
                value={field.value}
                onValueChange={handleOfferChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an offer" />
                </SelectTrigger>
                <SelectContent>
                  {offers.map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name} ({offer.payout === 0 ? 'Variable' : `$${offer.payout}`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pending" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Pending
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="converted" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Converted
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variable_payout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payout Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value === 'variable');
                    if (value === 'fixed') {
                      const selectedOffer = offers.find(offer => offer.id === form.getValues('offer_id'));
                      if (selectedOffer) {
                        form.setValue('payout', selectedOffer.payout);
                      }
                    }
                  }}
                  value={field.value ? 'variable' : 'fixed'}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fixed" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Fixed Payout
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="variable" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Variable per Sale
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
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
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={!form.watch('variable_payout') && !form.getValues('offer_id')}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Lead"}
        </Button>
      </form>
    </Form>
  );
}
