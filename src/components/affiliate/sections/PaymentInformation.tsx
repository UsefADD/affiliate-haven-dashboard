
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ApplicationFormData } from "../schema";

interface PaymentInformationProps {
  form: UseFormReturn<ApplicationFormData>;
}

export function PaymentInformation({ form }: PaymentInformationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-green-500" />
        Payment Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pay_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay To</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name/Company for payments" className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
