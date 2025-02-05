
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ApplicationFormData } from "../schema";

interface CommunicationDetailsProps {
  form: UseFormReturn<ApplicationFormData>;
}

export function CommunicationDetails({ form }: CommunicationDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-green-500" />
        Communication Details
      </h3>
      <FormField
        control={form.control}
        name="telegram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telegram Handle</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="im"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IM (Optional)</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="im_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IM Type (Optional)</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select IM type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skype">Skype</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="signal">Signal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
