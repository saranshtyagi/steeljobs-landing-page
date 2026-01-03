import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

interface PremiumAccessRequest {
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  companyPhone: string | null;
  recruiterId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recruiterName, recruiterEmail, companyName, companyPhone, recruiterId }: PremiumAccessRequest = await req.json();

    console.log("Premium access request received:", { recruiterName, recruiterEmail, companyName, recruiterId });

    if (!recruiterEmail || !companyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send notification email to sales team
    const salesEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">New Premium Access Request</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Recruiter Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 150px;">Contact Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${recruiterName || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Email:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;"><a href="mailto:${recruiterEmail}" style="color: #f97316;">${recruiterEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Company Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${companyPhone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Recruiter ID:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 12px;">${recruiterId}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
          <p style="margin: 0; color: #92400e;">
            <strong>Action Required:</strong> Please reach out to this recruiter to discuss premium candidate database access.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
          This email was sent from the SteelJobs recruitment platform.
        </p>
      </div>
    `;
    const salesEmailResponse = await sendEmail(
      ["support@oppexl.com"],
      `Premium Access Request - ${companyName}`,
      salesEmailHtml
    );

    console.log("Sales notification email sent:", salesEmailResponse);

    // Send confirmation email to recruiter
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0;">SteelJobs</h1>
          <p style="color: #6b7280; margin: 5px 0;">India's Premier Steel Industry Job Portal</p>
        </div>

        <h2 style="color: #333;">Thank You for Your Interest!</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Dear ${recruiterName || 'Hiring Manager'},
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          We have received your request for premium access to our comprehensive candidate database at <strong>SteelJobs</strong>.
        </p>

        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <h3 style="color: white; margin: 0 0 10px 0;">What's Next?</h3>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
            Our sales team will contact you within 24-48 business hours to discuss premium access options and pricing tailored to your hiring needs.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #374151; margin: 0 0 15px 0;">Premium Features Include:</h4>
          <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Access to complete candidate database with verified profiles</li>
            <li>Advanced search filters (skills, experience, location, salary expectations)</li>
            <li>Direct contact with candidates via email</li>
            <li>Resume downloads and candidate shortlisting</li>
            <li>Priority customer support</li>
          </ul>
        </div>

        <p style="color: #374151; line-height: 1.6;">
          If you have any immediate questions, please don't hesitate to reach out to us at 
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
    const confirmationEmailResponse = await sendEmail(
      [recruiterEmail],
      "Your Premium Access Request - SteelJobs",
      confirmationEmailHtml
    );

    console.log("Confirmation email sent to recruiter:", confirmationEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Premium access request submitted successfully",
        salesEmailId: salesEmailResponse?.id,
        confirmationEmailId: confirmationEmailResponse?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in request-premium-access function:", error);
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
