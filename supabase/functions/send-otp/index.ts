import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  name: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Retry wrapper for async operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== send-otp function invoked ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, name }: OTPRequest = body;
    
    console.log("Request body parsed:", { email, name: name ? "provided" : "not provided" });

    if (!email) {
      console.error("Email not provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    console.log("Checking if user exists with email:", email.toLowerCase());
    
    const { data: existingUsers, error: listError } = await withRetry(async () => {
      return await supabaseAdmin.auth.admin.listUsers();
    });
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to check user status. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      console.log("User already exists with email:", email);
      return new Response(
        JSON.stringify({ 
          error: "An account with this email already exists. Please sign in instead.",
          userExists: true 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    console.log("Generated OTP for email:", email.toLowerCase());

    // Delete any existing OTPs for this email first
    const { error: deleteError } = await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", email.toLowerCase());
    
    if (deleteError) {
      console.log("Warning: Error deleting old OTPs:", deleteError);
      // Continue anyway, not critical
    }

    // Insert new OTP with retry
    const { error: insertError } = await withRetry(async () => {
      return await supabaseAdmin
        .from("email_otps")
        .insert({
          email: email.toLowerCase(),
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          used: false,
        });
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("OTP stored successfully in database");

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Send email with OTP - with retry logic
    console.log("Sending OTP email to:", email);
    
    const emailResult = await withRetry(async () => {
      const response = await resend.emails.send({
        from: "SteelJobs <noreply@mail.mysteeljobs.com>",
        to: [email],
        subject: "Your SteelJobs Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">
              Email Verification
            </h1>
            <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 20px;">
              Hi ${name || "there"},
            </p>
            <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">
                ${otp}
              </span>
            </div>
            <p style="color: #4a4a4a; font-size: 14px; margin-bottom: 10px;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #4a4a4a; font-size: 14px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            <p style="color: #888; font-size: 12px;">
              © 2025 SteelJobs. All rights reserved.
            </p>
          </div>
        `,
      });
      
      // Check if email was actually sent
      if (response.error) {
        throw new Error(response.error.message || "Email sending failed");
      }
      
      return response;
    }, 3, 1000);

    // Verify email was sent successfully
    if (!emailResult.data?.id) {
      console.error("Email sending returned no ID:", emailResult);
      
      // Clean up the OTP since email failed
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("email", email.toLowerCase());
      
      return new Response(
        JSON.stringify({ error: "Failed to send verification email. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("OTP email sent successfully! Email ID:", emailResult.data.id);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to send OTP. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
