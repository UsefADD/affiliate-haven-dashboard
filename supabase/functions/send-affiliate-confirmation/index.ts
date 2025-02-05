
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email send process...");
    const { name, email }: EmailRequest = await req.json();
    console.log("Received request:", { name, email });

    if (!email || !name) {
      console.error("Missing required fields:", { email, name });
      throw new Error("Email and name are required");
    }

    console.log("Rendering email template...");
    const html = await renderAsync(
      ConfirmationEmail({ name })
    );

    console.log("Sending email via Resend...");
    const emailResponse = await resend.emails.send({
      from: "ClixAgent Affiliates <affiliates@clixagent.com>",
      to: [email],
      subject: "Your ClixAgent Affiliate Application Has Been Received",
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
