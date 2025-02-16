
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

      <FormField
        control={form.control}
        name="payment_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                // Reset other payment fields when method changes
                form.resetField("pay_to");
                form.resetField("crypto_currency");
                form.resetField("crypto_wallet");
                form.resetField("paypal_email");
                form.resetField("bank_name");
                form.resetField("bank_account_number");
                form.resetField("bank_swift");
                form.resetField("bank_address");
              }}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="wire">Wire Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("payment_method") === "wire" && (
        <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
          <FormField
            control={form.control}
            name="pay_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay To (Full Name/Company Name)</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number / IBAN</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_swift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SWIFT/BIC Code</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Address</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {form.watch("payment_method") === "paypal" && (
        <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
          <FormField
            control={form.control}
            name="pay_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay To (Full Name/Company Name)</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paypal_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PayPal Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {form.watch("payment_method") === "crypto" && (
        <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
          <FormField
            control={form.control}
            name="pay_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay To (Full Name/Company Name)</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="crypto_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cryptocurrency Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="crypto_wallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet Address</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
