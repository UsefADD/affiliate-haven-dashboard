
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Resend } from 'npm:resend@2.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { RejectionEmail } from './_templates/rejection.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  applicationId: string;
  status: 'approved' | 'rejected';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const { applicationId, status }: RequestData = await req.json()

    // Get application details
    const { data: application, error: fetchError } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('affiliate_applications')
      .update({ status })
      .eq('id', applicationId)

    if (updateError) {
      throw updateError
    }

    // Send email notification
    if (status === 'rejected') {
      console.log('Sending rejection email to:', application.email)
      
      const html = await renderAsync(
        RejectionEmail({ 
          name: `${application.first_name} ${application.last_name}`
        })
      )

      const { error: emailError } = await resend.emails.send({
        from: 'QuickBooks Enterprise <order@qbenterprise.com>',
        to: [application.email],
        subject: 'Your QuickBooks Enterprise Purchase Confirmation',
        html: html,
      })

      if (emailError) {
        console.error('Error sending email:', emailError)
        throw emailError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})
