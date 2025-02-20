
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ApplicationFormData } from "../schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentInformationProps {
  form: UseFormReturn<ApplicationFormData>;
}

export function PaymentInformation({ form }: PaymentInformationProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handlePaymentMethodChange = (value: "wire" | "paypal" | "crypto") => {
    console.log("Payment method selected:", value);
    form.setValue("payment_method", value);
    setDialogOpen(true);
  };

  const handleSavePaymentInfo = () => {
    const method = form.getValues("payment_method");
    let isValid = true;
    
    if (method === "wire") {
      const fields = ["bank_name", "bank_account_number", "bank_swift", "bank_address"];
      fields.forEach(field => {
        if (!form.getValues(field)) {
          isValid = false;
        }
      });
    } else if (method === "paypal") {
      if (!form.getValues("paypal_email")) {
        isValid = false;
      }
    } else if (method === "crypto") {
      if (!form.getValues("crypto_currency") || !form.getValues("crypto_wallet")) {
        isValid = false;
      }
    }

    if (!isValid) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setDialogOpen(false);
    toast({
      title: "Payment information saved",
      description: "You can continue with the application",
    });
  };

  const renderPaymentFields = () => {
    const method = form.getValues("payment_method");

    if (method === "wire") {
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name *</FormLabel>
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
                <FormLabel>Account Number / IBAN *</FormLabel>
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
                <FormLabel>SWIFT/BIC Code *</FormLabel>
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
                <FormLabel>Bank Address *</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (method === "paypal") {
      return (
        <FormField
          control={form.control}
          name="paypal_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PayPal Email Address *</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (method === "crypto") {
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="crypto_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cryptocurrency Type *</FormLabel>
                <Select 
                  value={field.value}
                  onValueChange={field.onChange}
                >
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
                <FormLabel>Wallet Address *</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

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
            <FormLabel>Payment Method *</FormLabel>
            <Select 
              value={field.value}
              onValueChange={handlePaymentMethodChange}
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

      <FormField
        control={form.control}
        name="pay_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pay To (Full Name/Company Name) *</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Enter Payment Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renderPaymentFields()}
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePaymentInfo}
              className="bg-green-500 hover:bg-green-600"
            >
              Save Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
