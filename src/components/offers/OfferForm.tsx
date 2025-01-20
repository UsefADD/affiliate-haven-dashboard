import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  payout: z.number().min(0, "Payout must be a positive number"),
  links: z.array(z.string()).optional(),
  creatives: z.array(z.object({
    type: z.enum(["image", "email"]),
    content: z.string(),
    details: z.object({
      fromNames: z.array(z.string()).optional(),
      subjects: z.array(z.string()).optional(),
    }).optional(),
    images: z.array(z.string()).optional(),
  })).optional(),
});

export type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  initialData?: OfferFormData;
  onSubmit: (data: OfferFormData) => void;
  isSubmitting?: boolean;
}

export function OfferForm({ initialData, onSubmit, isSubmitting }: OfferFormProps) {
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      payout: 0,
      links: [],
      creatives: [],
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray<OfferFormData>({
    control: form.control,
    name: "links",
  });

  const { fields: creativeFields, append: appendCreative, remove: removeCreative } = useFieldArray<OfferFormData>({
    control: form.control,
    name: "creatives",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Offer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Offer description" {...field} />
              </FormControl>
              <FormMessage />
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
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Tracking Links</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendLink("")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          {linkFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`links.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Enter tracking link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Creatives</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCreative({
                type: "email",
                content: "",
                details: { fromNames: [], subjects: [] },
                images: [],
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Creative
            </Button>
          </div>
          {creativeFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`creatives.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="email">Email</option>
                        <option value="image">Image</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`creatives.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Creative content" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch(`creatives.${index}.type`) === "email" && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>From Names</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentFromNames = form.getValues(`creatives.${index}.details.fromNames`) || [];
                          form.setValue(`creatives.${index}.details.fromNames`, [...currentFromNames, ""]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Name
                      </Button>
                    </div>
                    {(form.watch(`creatives.${index}.details.fromNames`) || []).map((_, nameIndex) => (
                      <div key={nameIndex} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`creatives.${index}.details.fromNames.${nameIndex}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter from name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const currentFromNames = form.getValues(`creatives.${index}.details.fromNames`) || [];
                            form.setValue(
                              `creatives.${index}.details.fromNames`,
                              currentFromNames.filter((_, i) => i !== nameIndex)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Subject Lines</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentSubjects = form.getValues(`creatives.${index}.details.subjects`) || [];
                          form.setValue(`creatives.${index}.details.subjects`, [...currentSubjects, ""]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                    {(form.watch(`creatives.${index}.details.subjects`) || []).map((_, subjectIndex) => (
                      <div key={subjectIndex} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`creatives.${index}.details.subjects.${subjectIndex}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter subject line" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const currentSubjects = form.getValues(`creatives.${index}.details.subjects`) || [];
                            form.setValue(
                              `creatives.${index}.details.subjects`,
                              currentSubjects.filter((_, i) => i !== subjectIndex)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => removeCreative(index)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Creative
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Create'} Offer
        </Button>
      </form>
    </Form>
  );
}
