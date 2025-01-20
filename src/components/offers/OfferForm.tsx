import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";
import { AffiliateLinksManager } from "./AffiliateLinksManager";

const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  payout: z.number().min(0, "Payout must be a positive number"),
  status: z.boolean().optional(),
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
  isAdmin?: boolean;
  editingOffer?: boolean;
}

export function OfferForm({ initialData, onSubmit, isSubmitting, isAdmin = false, editingOffer = false }: OfferFormProps) {
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      payout: 0,
      status: true,
      links: [],
      creatives: [],
    },
  });

  const appendLink = () => {
    const currentLinks = form.getValues("links") || [];
    form.setValue("links", [...currentLinks, ""]);
  };

  const removeLink = (index: number) => {
    const currentLinks = form.getValues("links") || [];
    form.setValue(
      "links",
      currentLinks.filter((_, i) => i !== index)
    );
  };

  const appendCreative = () => {
    const currentCreatives = form.getValues("creatives") || [];
    form.setValue("creatives", [
      ...currentCreatives,
      {
        type: "email",
        content: "",
        details: { fromNames: [], subjects: [] },
        images: [],
      },
    ]);
  };

  const removeCreative = (index: number) => {
    const currentCreatives = form.getValues("creatives") || [];
    form.setValue(
      "creatives",
      currentCreatives.filter((_, i) => i !== index)
    );
  };

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

        {isAdmin && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this offer for affiliates
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {isAdmin && editingOffer && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Offer Image</FormLabel>
            </div>
            <ImageUploader
              onUpload={(url) => {
                const currentCreatives = form.getValues("creatives") || [];
                form.setValue("creatives", [
                  ...currentCreatives,
                  {
                    type: "image",
                    content: url,
                    images: [url],
                  },
                ]);
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Tracking Links</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={appendLink}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          {(form.watch("links") || []).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
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
              onClick={appendCreative}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Creative
            </Button>
          </div>
          {(form.watch("creatives") || []).map((_, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
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

        {isAdmin && editingOffer && (
          <div className="mt-4">
            <AffiliateLinksManager offerId={editingOffer.id} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Create'} Offer
        </Button>
      </form>
    </Form>
  );
}
