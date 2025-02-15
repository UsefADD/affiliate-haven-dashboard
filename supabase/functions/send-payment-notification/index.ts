import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { renderAsync } from "npm:@react-email/components@0.0.22"
import { Resend } from "npm:resend@2.0.0"
import { PaymentEmail } from "./_templates/payment.tsx"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, email, amount } = await req.json()

    console.log(`Sending payment notification to ${email} for amount $${amount}`)

    const html = await renderAsync(
      PaymentEmail({ 
        name,
        amount,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'ClixAgent <payments@clixagent.com>',
      to: email,
      subject: 'Payment Confirmation from ClixAgent',
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-payment-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})