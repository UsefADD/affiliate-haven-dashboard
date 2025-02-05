
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ApplicationFormData } from "../schema";

interface AdditionalInformationProps {
  form: UseFormReturn<ApplicationFormData>;
}

export function AdditionalInformation({ form }: AdditionalInformationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Additional Information</h3>
      <FormField
        control={form.control}
        name="marketing_comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marketing Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="site_marketing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Site Marketing Methods (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="known_contacts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Known Contacts in the Industry</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="current_advertisers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Advertisers</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-white min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
