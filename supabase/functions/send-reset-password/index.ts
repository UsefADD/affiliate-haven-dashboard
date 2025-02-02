import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { renderAsync } from "npm:@react-email/components@0.0.12"
import { Resend } from "npm:resend@2.0.0"
import { ResetPasswordEmail } from "./_templates/reset-password.tsx"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetLink } = await req.json()
    console.log("Sending password reset email to:", email)
    console.log("Reset link:", resetLink)

    const html = await renderAsync(
      ResetPasswordEmail({
        resetLink,
        userEmail: email,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'ClixAgent <noreply@clixagent.com>',
      to: [email],
      subject: 'Reset Your ClixAgent Password',
      html: html,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw error
    }

    console.log("Password reset email sent successfully:", data)

    return new Response(
      JSON.stringify({ message: "Password reset email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in send-reset-password function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})