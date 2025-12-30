import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeatureRequestPayload {
  requestType: "premium_access" | "mock_interview";
  userName: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Feature request function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { requestType, userName, userEmail }: FeatureRequestPayload = await req.json();
    console.log(`Processing ${requestType} request from ${userName} (${userEmail})`);

    // Validate input
    if (!requestType || !userName || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isPremium = requestType === "premium_access";
    const subject = isPremium 
      ? `Premium Access Request from ${userName}`
      : `Mock Interview Session Request from ${userName}`;

    const htmlContent = isPremium
      ? `
        <h2>New Premium Access Request</h2>
        <p>A user has requested premium access on SteelJobs.</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${userEmail}">${userEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Request Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Premium Career Tools (₹2,000)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Requested At</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>
        <p>Please follow up with the user to complete the premium access setup.</p>
      `
      : `
        <h2>New Mock Interview Session Request</h2>
        <p>A user has requested a 1-on-1 mock interview session on SteelJobs.</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${userEmail}">${userEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Request Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">Mock Interview Session (₹500)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Requested At</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>
        <p>Please follow up with the user to schedule the mock interview session.</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "SteelJobs <noreply@mail.mysteeljobs.com>",
      to: ["support@oppexl.com"],
      subject: subject,
      html: htmlContent,
      reply_to: userEmail,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Request submitted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-feature-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to submit request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
