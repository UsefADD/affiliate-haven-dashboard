
import { useState } from "react";
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
import { memo } from 'react';

// Memoize form sections for better performance
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
      payment_method: "",
      pay_to: "",
      marketing_comments: "",
      site_marketing: "",
      known_contacts: "",
      current_advertisers: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const applicationData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        address: data.address,
        apt_suite: data.apt_suite || null,
        city: data.city,
        state: data.state,
        zip_postal: data.zip_postal,
        country: data.country,
        telegram: data.telegram,
        im: data.im || null,
        im_type: data.im_type || null,
        title: data.title || null,
        website_url: data.website_url || null,
        payment_method: data.payment_method,
        pay_to: data.pay_to,
        marketing_comments: data.marketing_comments || null,
        site_marketing: data.site_marketing || null,
        known_contacts: data.known_contacts,
        current_advertisers: data.current_advertisers,
        status: 'pending'
      };

      const { error } = await supabase
        .from("affiliate_applications")
        .insert(applicationData);

      if (error) throw error;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke("send-affiliate-confirmation", {
        body: { name: data.first_name, email: data.email }
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      setShowThankYou(true);
      onSuccess?.();
      
      toast({
        title: "Success!",
        description: "Your application has been submitted successfully.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600"
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-green-600">
              <Check className="h-6 w-6 text-green-500" />
              Application Submitted Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Thank you for submitting your affiliate application to ClixAgent. We're excited about the possibility of working together!
            </p>
            <p className="text-center text-gray-500">
              We've sent you a confirmation email with more details. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <Button onClick={() => setShowThankYou(false)} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Close
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
