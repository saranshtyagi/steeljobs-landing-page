import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const sendEmail = async (to: string[], subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SteelJobs <noreply@mail.mysteeljobs.com>",
      to,
      subject,
      html,
    }),
  });
  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GrantPremiumRequest {
  recruiterId: string;
  grantAccess: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { recruiterId, grantAccess }: GrantPremiumRequest = await req.json();

    console.log("Premium access update request:", { recruiterId, grantAccess });

    if (!recruiterId) {
      return new Response(
        JSON.stringify({ error: "Missing recruiter ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update the recruiter's premium access status
    const { error: updateError } = await supabaseClient
      .from("recruiter_profiles")
      .update({ has_premium_access: grantAccess })
      .eq("id", recruiterId);

    if (updateError) {
      console.error("Error updating premium access:", updateError);
      throw updateError;
    }

    // If granting access, send notification email
    if (grantAccess) {
      // Get recruiter details
      const { data: recruiter, error: fetchError } = await supabaseClient
        .from("recruiter_profiles")
        .select("company_name, contact_name, contact_email, user_id")
        .eq("id", recruiterId)
        .single();

      if (fetchError) {
        console.error("Error fetching recruiter:", fetchError);
      } else if (recruiter) {
        // Get user email from profiles
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("user_id", recruiter.user_id)
          .single();

        const email = recruiter.contact_email || profile?.email;

        if (email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f97316; margin: 0;">SteelJobs</h1>
                <p style="color: #6b7280; margin: 5px 0;">India's Premier Steel Industry Job Portal</p>
              </div>

              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
                <h2 style="color: white; margin: 0 0 10px 0;">🎉 Premium Access Granted!</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                  Congratulations! Your account has been upgraded.
                </p>
              </div>

              <p style="color: #374151; line-height: 1.6;">
                Dear ${recruiter.contact_name || 'Hiring Manager'},
              </p>
              
              <p style="color: #374151; line-height: 1.6;">
                We're excited to inform you that <strong>${recruiter.company_name}</strong> has been granted premium access to the SteelJobs candidate database!
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #374151; margin: 0 0 15px 0;">You now have access to:</h4>
                <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Complete candidate database with verified profiles</li>
                  <li>Advanced search filters (skills, experience, location, salary)</li>
                  <li>Direct contact with candidates via email</li>
                  <li>Resume downloads and candidate shortlisting</li>
                  <li>Priority customer support</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mysteeljobs.com/dashboard/recruiter" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Start Searching Candidates
                </a>
              </div>

              <p style="color: #374151; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to reach out to us at 
                <a href="mailto:support@oppexl.com" style="color: #f97316;">support@oppexl.com</a>.
              </p>

              <p style="color: #374151; line-height: 1.6;">
                Best regards,<br/>
                <strong>The SteelJobs Team</strong>
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © 2025 SteelJobs. All rights reserved.<br/>
                <a href="https://mysteeljobs.com" style="color: #f97316;">www.mysteeljobs.com</a>
              </p>
            </div>
          `;

          const emailResponse = await sendEmail(
            [email],
            "🎉 Premium Access Granted - SteelJobs",
            emailHtml
          );

          console.log("Premium access notification email sent:", emailResponse);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: grantAccess ? "Premium access granted" : "Premium access revoked"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in grant-premium-access function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
