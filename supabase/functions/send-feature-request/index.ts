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
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { requestType, userName, userEmail }: FeatureRequestPayload = await req.json();
    console.log(`Processing ${requestType} request from ${userName} (${userEmail})`);

    // Validate input
    if (!requestType || !userName || !userEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map requestType to database format
    const dbRequestType = requestType === "premium_access" ? "premium" : "mock_interview";

    // Get candidate profile
    const { data: candidateProfile, error: profileError } = await supabaseClient
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !candidateProfile) {
      console.error("Profile error:", profileError);
      return new Response(JSON.stringify({ error: "Candidate profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has a pending request
    const { data: existingRequest, error: existingError } = await supabaseClient
      .from("feature_requests")
      .select("id, status")
      .eq("candidate_id", candidateProfile.id)
      .eq("request_type", dbRequestType)
      .eq("status", "pending")
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing request:", existingError);
    }

    if (existingRequest) {
      console.log("User already has a pending request");
      return new Response(JSON.stringify({ 
        error: "Request already submitted", 
        alreadySubmitted: true 
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the request to database
    const { error: insertError } = await supabaseClient
      .from("feature_requests")
      .insert({
        user_id: user.id,
        candidate_id: candidateProfile.id,
        request_type: dbRequestType,
        user_name: userName,
        user_email: userEmail,
        status: "pending",
      });

    if (insertError) {
      console.error("Error saving request:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPremium = requestType === "premium_access";

    // Email to support team
    const supportSubject = isPremium
      ? `Premium Access Request from ${userName}`
      : `Mock Interview Session Request from ${userName}`;

    const supportHtmlContent = isPremium
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
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
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
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
          </tr>
        </table>
        <p>Please follow up with the user to schedule the mock interview session.</p>
      `;

    // User confirmation email
    const userSubject = isPremium
      ? "Your Premium Access Request - SteelJobs"
      : "Your Mock Interview Session Request - SteelJobs";

    const userHtmlContent = isPremium
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">SteelJobs</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}! 👋</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in our <strong>Premium Career Tools</strong>!
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We've received your request and our team will reach out to you shortly to help you unlock:
            </p>
            <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
              <li>🎥 Mock Interviews with industry experts</li>
              <li>📄 Professional Resume Building sessions</li>
              <li>🎓 Personalized Learning Paths</li>
              <li>📚 Industry-specific Courses</li>
            </ul>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Premium Access:</strong> ₹2,000
              </p>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              If you have any questions, feel free to contact us at <a href="mailto:support@oppexl.com" style="color: #f59e0b;">support@oppexl.com</a>
            </p>
            <p style="color: #4b5563; font-size: 16px; margin-top: 30px;">
              Best regards,<br>
              <strong>The SteelJobs Team</strong>
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} SteelJobs. All rights reserved.</p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">SteelJobs</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}! 👋</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in our <strong>1-on-1 Mock Interview Session</strong>!
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We've received your booking request and our team will contact you shortly to schedule your session.
            </p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">What to expect:</h3>
              <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>👤 1-on-1 session with an industry professional</li>
                <li>🎯 Role-specific interview questions</li>
                <li>💬 Real-time feedback & tips</li>
                <li>⚡ Boost your interview confidence</li>
              </ul>
            </div>
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                <strong>Session Fee:</strong> ₹500 | <strong>Duration:</strong> 30 minutes
              </p>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              If you have any questions, feel free to contact us at <a href="mailto:support@oppexl.com" style="color: #3b82f6;">support@oppexl.com</a>
            </p>
            <p style="color: #4b5563; font-size: 16px; margin-top: 30px;">
              Best regards,<br>
              <strong>The SteelJobs Team</strong>
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} SteelJobs. All rights reserved.</p>
          </div>
        </div>
      `;

    // Send both emails in parallel
    const [supportEmailResponse, userEmailResponse] = await Promise.all([
      resend.emails.send({
        from: "SteelJobs <noreply@mail.mysteeljobs.com>",
        to: ["support@oppexl.com"],
        subject: supportSubject,
        html: supportHtmlContent,
        reply_to: userEmail,
      }),
      resend.emails.send({
        from: "SteelJobs <noreply@mail.mysteeljobs.com>",
        to: [userEmail],
        subject: userSubject,
        html: userHtmlContent,
      }),
    ]);

    console.log("Support email sent:", supportEmailResponse);
    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(JSON.stringify({ success: true, message: "Request submitted successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-feature-request function:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to submit request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);