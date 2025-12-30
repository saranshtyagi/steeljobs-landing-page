import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
  name: string;
  password: string;
  role: "recruiter" | "candidate";
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
  console.log("=== verify-otp function invoked ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, otp, name, password, role }: VerifyOTPRequest = body;

    console.log("Verify OTP request received for email:", email, "role:", role);

    if (!email || !otp || !password || !role) {
      console.log("Missing required fields:", { email: !!email, otp: !!otp, password: !!password, role: !!role });
      return new Response(
        JSON.stringify({ error: "Email, OTP, password, and role are required" }),
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

    // Check if user already exists
    console.log("Checking if user already exists");
    const { data: existingUsers, error: listError } = await withRetry(async () => {
      return await supabaseAdmin.auth.admin.listUsers();
    });
    
    if (listError) {
      console.error("Error listing users:", listError);
    }
    
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      console.log("User already exists with this email");
      
      // Delete the OTP record
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "An account with this email already exists. Please sign in instead." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the user with email confirmed
    console.log("Creating new user with email:", email.toLowerCase());
    
    const { data: authData, error: signUpError } = await withRetry(async () => {
      return await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name || "",
        },
      });
    });

    if (signUpError) {
      console.error("Error creating user:", signUpError);
      
      // Reset OTP used status so user can try again
      await supabaseAdmin
        .from("email_otps")
        .update({ used: false })
        .eq("id", otpRecord.id);
      
      return new Response(
        JSON.stringify({ error: signUpError.message || "Failed to create account. Please try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!authData.user) {
      console.error("No user data returned after creation");
      
      // Reset OTP used status
      await supabaseAdmin
        .from("email_otps")
        .update({ used: false })
        .eq("id", otpRecord.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to create user. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User created successfully with ID:", authData.user.id);

    // Insert user role with retry
    console.log("Inserting user role:", role);
    
    const { error: roleError } = await withRetry(async () => {
      return await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: role,
        });
    });

    if (roleError) {
      console.error("Error inserting role:", roleError);
      
      // Clean up the user if role insertion fails
      console.log("Cleaning up user due to role insertion failure");
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      // Reset OTP so user can try again
      await supabaseAdmin
        .from("email_otps")
        .update({ used: false })
        .eq("id", otpRecord.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to set up account. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User role inserted successfully");

    // Delete the OTP record after successful verification
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("id", otpRecord.id);

    console.log("OTP record deleted, account creation complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        user_id: authData.user.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "Verification failed. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
