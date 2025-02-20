import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Check } from "lucide-react";
import { applicationSchema, ApplicationFormData } from "./schema";
import { PersonalInformation } from "./sections/PersonalInformation";
import { AddressInformation } from "./sections/AddressInformation";
import { CommunicationDetails } from "./sections/CommunicationDetails";
import { BusinessInformation } from "./sections/BusinessInformation";
import { PaymentInformation } from "./sections/PaymentInformation";
import { AdditionalInformation } from "./sections/AdditionalInformation";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const MemoizedPersonalInformation = memo(PersonalInformation);
const MemoizedAddressInformation = memo(AddressInformation);
const MemoizedCommunicationDetails = memo(CommunicationDetails);
const MemoizedBusinessInformation = memo(BusinessInformation);
const MemoizedPaymentInformation = memo(PaymentInformation);
const MemoizedAdditionalInformation = memo(AdditionalInformation);

interface AffiliateApplicationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AffiliateApplicationForm({ onSuccess, onCancel }: AffiliateApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();

  const handleCloseDialog = () => {
    setShowThankYou(false);
    onSuccess?.();
  };

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      apt_suite: "",
      city: "",
      state: "",
      zip_postal: "",
      country: "",
      telegram: "",
      im: "",
      im_type: "",
      title: "",
      website_url: "",
      payment_method: undefined,
      pay_to: "",
      crypto_currency: "",
      crypto_wallet: "",
      paypal_email: "",
      bank_account_number: "",
      bank_swift: "",
      bank_name: "",
      bank_address: "",
      marketing_comments: "",
      site_marketing: "",
      known_contacts: "",
      current_advertisers: "",
    },
    mode: "onBlur"
  });

  const onSubmit = async (formData: ApplicationFormData) => {
    console.log("Form submission triggered with data:", formData);
    
    if (isSubmitting) {
      console.log("Already submitting, preventing double submission");
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionData = {
        ...formData,
        paypal_email: formData.payment_method === "paypal" ? formData.paypal_email : null,
        crypto_currency: formData.payment_method === "crypto" ? formData.crypto_currency : null,
        crypto_wallet: formData.payment_method === "crypto" ? formData.crypto_wallet : null,
        bank_account_number: formData.payment_method === "wire" ? formData.bank_account_number : null,
        bank_swift: formData.payment_method === "wire" ? formData.bank_swift : null,
        bank_name: formData.payment_method === "wire" ? formData.bank_name : null,
        bank_address: formData.payment_method === "wire" ? formData.bank_address : null,
      };

      const { error: submissionError } = await supabase
        .from('affiliate_applications')
        .insert([{
          ...submissionData,
          status: 'pending'
        }]);

      if (submissionError) {
        throw submissionError;
      }

      const { error: emailError } = await supabase.functions.invoke('send-affiliate-confirmation', {
        body: {
          name: formData.first_name,
          email: formData.email
        }
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "Check your email for confirmation details.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600"
      });

      form.reset();
      setShowThankYou(true);

    } catch (error: any) {
      console.error('Application submission error:', error);
      toast({
        title: "Error Submitting Application",
        description: error.message || "We encountered an error. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
      <Dialog open={showThankYou} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-green-600">Application Submitted Successfully!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-700 font-medium text-lg">
              Thank you for choosing to partner with ClixAgent!
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-600">What happens next:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Check your email for a confirmation</li>
                <li>Application review (2-3 business days)</li>
                <li>Decision notification via email</li>
                <li>If approved, receive onboarding details</li>
              </ul>
            </div>
            <Button 
              onClick={handleCloseDialog}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-green-600">
            Affiliate Application
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join our affiliate program and start earning today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <MemoizedPersonalInformation form={form} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-500" />
                    Company Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Company (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <MemoizedAddressInformation form={form} />
                <MemoizedCommunicationDetails form={form} />
                <MemoizedBusinessInformation form={form} />
                <MemoizedPaymentInformation form={form} />
                <MemoizedAdditionalInformation form={form} />
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full md:w-auto border-green-500 text-green-600 hover:bg-green-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
