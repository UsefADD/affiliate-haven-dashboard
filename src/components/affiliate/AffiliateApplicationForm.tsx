
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { applicationSchema, ApplicationFormData } from "./schema";
import { PersonalInformation } from "./sections/PersonalInformation";
import { AddressInformation } from "./sections/AddressInformation";
import { CommunicationDetails } from "./sections/CommunicationDetails";
import { BusinessInformation } from "./sections/BusinessInformation";
import { PaymentInformation } from "./sections/PaymentInformation";
import { AdditionalInformation } from "./sections/AdditionalInformation";

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
      const { error } = await supabase
        .from("affiliate_applications")
        .insert(data);

      if (error) throw error;

      setShowThankYou(true);
      onSuccess?.();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-8">
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">Thank You for Your Application!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-600">Thank you for submitting your affiliate application. Our team will review your information carefully and get back to you soon.</p>
            <p className="text-center text-gray-500">We typically respond within 2-3 business days.</p>
            <Button onClick={() => setShowThankYou(false)} className="w-full bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Affiliate Application
          </CardTitle>
          <CardDescription className="text-gray-500">
            Join our affiliate program and start earning today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <PersonalInformation form={form} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <div className="form-item">
                        <label className="form-label">Company (Optional)</label>
                        <input {...field} className="form-input" />
                      </div>
                    )}
                  />
                </div>
                <AddressInformation form={form} />
                <CommunicationDetails form={form} />
                <BusinessInformation form={form} />
                <PaymentInformation form={form} />
                <AdditionalInformation form={form} />
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90"
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
