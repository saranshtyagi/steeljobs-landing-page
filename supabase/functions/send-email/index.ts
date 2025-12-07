import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRecipient {
  email: string;
  name: string;
  candidateId: string;
}

interface SendEmailRequest {
  recipients: EmailRecipient[];
  subject: string;
  body: string;
  templateId?: string;
  jobId?: string;
}

const EMAIL_TEMPLATES = {
  shortlist: {
    subject: "Great news! You've been shortlisted for {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

We are excited to inform you that your application for the {{jobTitle}} position at {{companyName}} has been shortlisted!

Our team was impressed with your profile and would like to move forward with your application. We will be in touch soon with next steps regarding the interview process.

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  interview: {
    subject: "Interview Invitation: {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

We are pleased to invite you for an interview for the {{jobTitle}} position at {{companyName}}.

Please let us know your availability for the coming week, and we will schedule a convenient time for the interview.

Looking forward to speaking with you!

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  request_details: {
    subject: "Additional Information Required - {{jobTitle}} Application",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}.

To proceed with your application, we would appreciate if you could provide us with some additional information:

1. Updated resume/CV
2. Portfolio or work samples (if applicable)
3. References

Please reply to this email with the requested documents at your earliest convenience.

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  rejection: {
    subject: "Update on your application for {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.

We appreciate your interest in our company and encourage you to apply for future opportunities that match your skills and experience.

We wish you the best in your job search.

Best regards,
{{recruiterName}}
{{companyName}}`
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is a recruiter
    const { data: recruiterProfile, error: recruiterError } = await supabase
      .from("recruiter_profiles")
      .select("id, company_name, contact_name")
      .eq("user_id", user.id)
      .single();

    if (recruiterError || !recruiterProfile) {
      console.error("Recruiter profile error:", recruiterError);
      return new Response(
        JSON.stringify({ error: "Only recruiters can send emails" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request
    const { recipients, subject, body, templateId, jobId }: SendEmailRequest = await req.json();

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No recipients provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: "Subject and body are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting check - max 50 emails per hour per recruiter
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentLogs, error: logsError } = await supabase
      .from("email_logs")
      .select("sent_to_count")
      .eq("recruiter_id", recruiterProfile.id)
      .gte("created_at", oneHourAgo);

    if (!logsError && recentLogs) {
      const totalSent = recentLogs.reduce((sum, log) => sum + (log.sent_to_count || 0), 0);
      if (totalSent + recipients.length > 50) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Maximum 50 emails per hour." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get job details if jobId provided
    let jobTitle = "";
    if (jobId) {
      const { data: job } = await supabase
        .from("jobs")
        .select("title")
        .eq("id", jobId)
        .single();
      jobTitle = job?.title || "";
    }

    // Send emails in batches
    const BATCH_SIZE = 10;
    const successfulRecipients: EmailRecipient[] = [];
    const failedRecipients: { recipient: EmailRecipient; error: string }[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (recipient) => {
        try {
          // Validate email exists
          if (!recipient.email) {
            failedRecipients.push({ recipient, error: "No email address" });
            return;
          }

          // Replace placeholders
          let personalizedBody = body
            .replace(/\{\{candidateName\}\}/g, recipient.name || "Candidate")
            .replace(/\{\{companyName\}\}/g, recruiterProfile.company_name)
            .replace(/\{\{recruiterName\}\}/g, recruiterProfile.contact_name || "Hiring Team")
            .replace(/\{\{jobTitle\}\}/g, jobTitle);

          let personalizedSubject = subject
            .replace(/\{\{candidateName\}\}/g, recipient.name || "Candidate")
            .replace(/\{\{companyName\}\}/g, recruiterProfile.company_name)
            .replace(/\{\{jobTitle\}\}/g, jobTitle);

          const emailResponse = await resend.emails.send({
            from: `${recruiterProfile.company_name} <onboarding@resend.dev>`,
            to: [recipient.email],
            subject: personalizedSubject,
            html: personalizedBody.replace(/\n/g, "<br>"),
          });

          console.log(`Email sent to ${recipient.email}:`, emailResponse);
          successfulRecipients.push(recipient);
        } catch (error: any) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          failedRecipients.push({ recipient, error: error.message });
        }
      }));
    }

    // Log the email send
    const { error: logError } = await supabase
      .from("email_logs")
      .insert({
        recruiter_id: recruiterProfile.id,
        subject: subject,
        body_preview: body.substring(0, 200),
        template_id: templateId || null,
        job_id: jobId || null,
        sent_to_count: successfulRecipients.length,
        recipients: successfulRecipients.map(r => ({ 
          email: r.email, 
          name: r.name, 
          candidateId: r.candidateId 
        })),
      });

    if (logError) {
      console.error("Failed to log email:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successfulRecipients.length,
        failed: failedRecipients.length,
        failedRecipients: failedRecipients.map(f => ({ email: f.recipient.email, error: f.error })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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
