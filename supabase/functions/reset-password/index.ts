import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
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
  console.log("=== reset-password function invoked ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, otp, newPassword }: ResetPasswordRequest = body;

    console.log("Reset password request received for email:", email);

    if (!email || !otp || !newPassword) {
      console.log("Missing required fields:", { email: !!email, otp: !!otp, newPassword: !!newPassword });
      return new Response(
        JSON.stringify({ error: "Email, OTP, and new password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      console.log("Invalid OTP format:", otp);
      return new Response(
        JSON.stringify({ error: "Invalid OTP format. Please enter a 6-digit code." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log("Password too short");
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters long." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (newPassword.length > 72) {
      console.log("Password too long");
      return new Response(
        JSON.stringify({ error: "Password must be less than 72 characters." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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

    // Get the OTP from database with retry
    console.log("Fetching OTP record for email:", email.toLowerCase());
    
    const { data: otpRecord, error: fetchError } = await withRetry(async () => {
      return await supabaseAdmin
        .from("email_otps")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("otp_code", otp)
        .maybeSingle();
    });

    console.log("OTP fetch result:", { found: !!otpRecord, error: fetchError?.message });

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!otpRecord) {
      console.log("OTP not found for email:", email.toLowerCase(), "with code:", otp);
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please check and try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    
    console.log("OTP expiry check - now:", now.toISOString(), "expires:", expiresAt.toISOString());
    
    if (expiresAt < now) {
      console.log("OTP has expired");
      
      // Delete expired OTP
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already used
    if (otpRecord.used) {
      console.log("OTP has already been used");
      return new Response(
        JSON.stringify({ error: "OTP has already been used. Please request a new one." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used immediately to prevent race conditions
    const { error: updateError } = await supabaseAdmin
      .from("email_otps")
      .update({ used: true })
      .eq("id", otpRecord.id)
      .eq("used", false); // Only update if not already used

    if (updateError) {
      console.error("Error marking OTP as used:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Find the user
    console.log("Finding user with email:", email.toLowerCase());
    const { data: existingUsers, error: listError } = await withRetry(async () => {
      return await supabaseAdmin.auth.admin.listUsers();
    });
    
    if (listError) {
      console.error("Error listing users:", listError);
      
      // Reset OTP used status
      await supabaseAdmin
        .from("email_otps")
        .update({ used: false })
        .eq("id", otpRecord.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to find user. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const user = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.log("No user found with email:", email.toLowerCase());
      
      // Delete the OTP record
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "No account found with this email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update the user's password
    console.log("Updating password for user:", user.id);
    
    const { error: updatePasswordError } = await withRetry(async () => {
      return await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });
    });

    if (updatePasswordError) {
      console.error("Error updating password:", updatePasswordError);
      
      // Reset OTP used status so user can try again
      await supabaseAdmin
        .from("email_otps")
        .update({ used: false })
        .eq("id", otpRecord.id);
      
      return new Response(
        JSON.stringify({ error: updatePasswordError.message || "Failed to update password. Please try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Password updated successfully for user:", user.id);

    // Delete the OTP record after successful password reset
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("id", otpRecord.id);

    console.log("OTP record deleted, password reset complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "Password reset failed. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
