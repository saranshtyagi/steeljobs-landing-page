import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetOTPRequest {
  email: string;
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
  console.log("=== send-password-reset-otp function invoked ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email }: PasswordResetOTPRequest = body;
    
    console.log("Request body parsed:", { email });

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

    // Check if user exists
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

    if (!existingUser) {
      console.log("No user found with email:", email);
      // For security, we don't reveal if email exists or not
      // Still return success to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset code will be sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    console.log("Generated password reset OTP for email:", email.toLowerCase());

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

    // Get user's name from profile if available
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", existingUser.id)
      .maybeSingle();

    const userName = profile?.name || "there";

    // Send email with OTP - with retry logic
    console.log("Sending password reset OTP email to:", email);
    
    const emailResult = await withRetry(async () => {
      const response = await resend.emails.send({
        from: "SteelJobs <noreply@mail.mysteeljobs.com>",
        to: [email],
        subject: "Password Reset Code - SteelJobs",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">
              Password Reset Request
            </h1>
            <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Use the code below to proceed:
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">
                ${otp}
              </span>
            </div>
            <p style="color: #4a4a4a; font-size: 14px; margin-bottom: 10px;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #e53e3e; font-size: 14px; margin-bottom: 10px;">
              ⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            <p style="color: #4a4a4a; font-size: 14px;">
              For security, never share this code with anyone.
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
        JSON.stringify({ error: "Failed to send password reset email. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Password reset OTP email sent successfully! Email ID:", emailResult.data.id);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset code sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset-otp function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to send password reset code. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
