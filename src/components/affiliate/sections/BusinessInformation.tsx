
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Building } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ApplicationFormData } from "../schema";

interface BusinessInformationProps {
  form: UseFormReturn<ApplicationFormData>;
}

export function BusinessInformation({ form }: BusinessInformationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <Building className="h-5 w-5 text-primary" />
        Business Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
