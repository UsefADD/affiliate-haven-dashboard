
import * as z from "zod";

export const applicationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  apt_suite: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_postal: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  telegram: z.string().min(1, "Telegram handle is required"),
  im: z.string().optional(),
  im_type: z.string().optional(),
  title: z.string().optional(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  payment_method: z.enum(["wire", "paypal", "crypto"]).optional(),
  pay_to: z.string().min(1, "Pay to name is required"),
  crypto_currency: z.string().optional(),
  crypto_wallet: z.string().optional(),
  paypal_email: z.string().email("Invalid PayPal email").optional(),
  bank_account_number: z.string().optional(),
  bank_swift: z.string().optional(),
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  marketing_comments: z.string().optional(),
  site_marketing: z.string().optional(),
  known_contacts: z.string().min(1, "Known contacts information is required"),
  current_advertisers: z.string().min(1, "Current advertisers information is required"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
