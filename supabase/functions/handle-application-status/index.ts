
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ApprovalEmail } from './_templates/approval.tsx';
import { RejectionEmail } from './_templates/rejection.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApplicationRequest {
  applicationId: string;
  status: 'approved' | 'rejected';
}

function generateSecurePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length;
    password += charset[randomIndex];
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { applicationId, status }: ApplicationRequest = await req.json();
    console.log("Processing application:", { applicationId, status });

    // Fetch application details
    const { data: application, error: fetchError } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      console.error("Error fetching application:", fetchError);
      throw new Error("Application not found");
    }

    if (status === 'approved') {
      console.log("Approving application for:", application.email);
      const password = generateSecurePassword();

      // Create user account
      const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: application.email,
        password: password,
        email_confirm: true,
      });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        throw createUserError;
      }

      console.log("User created successfully:", authUser.user.id);

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: application.first_name,
          last_name: application.last_name,
          company: application.company,
          role: 'affiliate',
        })
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Send approval email
      console.log("Sending approval email to:", application.email);
      const approvalHtml = await renderAsync(ApprovalEmail({
        name: `${application.first_name} ${application.last_name}`,
        email: application.email,
        password: password,
      }));

      const { error: emailError } = await resend.emails.send({
        from: "ClixAgent Affiliates <affiliates@clixagent.com>",
        to: [application.email],
        subject: "Welcome to ClixAgent Partner Program - Application Approved!",
        html: approvalHtml,
      });

      if (emailError) {
        console.error("Error sending approval email:", emailError);
        throw emailError;
      }
    } else if (status === 'rejected') {
      console.log("Sending rejection email to:", application.email);
      const rejectionHtml = await renderAsync(RejectionEmail({
        name: `${application.first_name} ${application.last_name}`,
      }));

      const { error: emailError } = await resend.emails.send({
        from: "ClixAgent Affiliates <affiliates@clixagent.com>",
        to: [application.email],
        subject: "Update on Your ClixAgent Partner Program Application",
        html: rejectionHtml,
      });

      if (emailError) {
        console.error("Error sending rejection email:", emailError);
        throw emailError;
      }
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('affiliate_applications')
      .update({ status })
      .eq('id', applicationId);

    if (updateError) {
      console.error("Error updating application status:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing application:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Check function logs for more information",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
