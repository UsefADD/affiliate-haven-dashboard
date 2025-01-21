import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, ImagePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MAX_IMAGES = 5;

const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  payout: z.number().min(0, "Payout must be a positive number"),
  status: z.boolean().optional(),
  is_top_offer: z.boolean().optional(),
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
}

export function OfferForm({ initialData, onSubmit, isSubmitting, isAdmin = false }: OfferFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.creatives?.[0]?.images || []
  );
  const { toast } = useToast();
  
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      payout: 0,
      status: true,
      is_top_offer: false,
      links: [],
      creatives: [{
        type: "email",
        content: "",
        details: { fromNames: [], subjects: [] },
        images: [],
      }],
    },
  });

  const handleImageUpload = (url: string) => {
    if (uploadedImages.length >= MAX_IMAGES) {
      toast({
        title: "Error",
        description: `Maximum ${MAX_IMAGES} images allowed`,
        variant: "destructive",
      });
      return;
    }

    const newImages = [...uploadedImages, url];
    setUploadedImages(newImages);

    // Update the form's creative images
    const currentCreatives = form.getValues("creatives") || [];
    const updatedCreatives = currentCreatives.map(creative => ({
      ...creative,
      images: newImages
    }));
    form.setValue("creatives", updatedCreatives);
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(newImages);

    // Update the form's creative images
    const currentCreatives = form.getValues("creatives") || [];
    const updatedCreatives = currentCreatives.map(creative => ({
      ...creative,
      images: newImages
    }));
    form.setValue("creatives", updatedCreatives);
  };

  const appendFromName = (creativeIndex: number) => {
    const currentFromNames = form.getValues(`creatives.${creativeIndex}.details.fromNames`) || [];
    form.setValue(`creatives.${creativeIndex}.details.fromNames`, [...currentFromNames, ""]);
  };

  const removeFromName = (creativeIndex: number, nameIndex: number) => {
    const currentFromNames = form.getValues(`creatives.${creativeIndex}.details.fromNames`) || [];
    form.setValue(
      `creatives.${creativeIndex}.details.fromNames`,
      currentFromNames.filter((_, i) => i !== nameIndex)
    );
  };

  const appendSubject = (creativeIndex: number) => {
    const currentSubjects = form.getValues(`creatives.${creativeIndex}.details.subjects`) || [];
    form.setValue(`creatives.${creativeIndex}.details.subjects`, [...currentSubjects, ""]);
  };

  const removeSubject = (creativeIndex: number, subjectIndex: number) => {
    const currentSubjects = form.getValues(`creatives.${creativeIndex}.details.subjects`) || [];
    form.setValue(
      `creatives.${creativeIndex}.details.subjects`,
      currentSubjects.filter((_, i) => i !== subjectIndex)
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
          <>
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

            <FormField
              control={form.control}
              name="is_top_offer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Top Offer</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this as a top offer to feature it on the affiliate dashboard
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
          </>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Creatives</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentCreatives = form.getValues("creatives") || [];
                form.setValue("creatives", [
                  ...currentCreatives,
                  {
                    type: "image",
                    content: "",
                    details: { fromNames: [], subjects: [] },
                    images: uploadedImages,
                  },
                ]);
              }}
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

              <div>
                <FormLabel>Images ({uploadedImages.length}/{MAX_IMAGES})</FormLabel>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {uploadedImages.map((url, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={url}
                        alt={`Uploaded ${imgIndex + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(imgIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {uploadedImages.length < MAX_IMAGES && (
                    <ImageUploader onUpload={handleImageUpload} />
                  )}
                </div>
              </div>

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
                        onClick={() => appendFromName(index)}
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
                          onClick={() => removeFromName(index, nameIndex)}
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
                        onClick={() => appendSubject(index)}
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
                          onClick={() => removeSubject(index, subjectIndex)}
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
                onClick={() => {
                  const currentCreatives = form.getValues("creatives") || [];
                  form.setValue(
                    "creatives",
                    currentCreatives.filter((_, i) => i !== index)
                  );
                }}
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
