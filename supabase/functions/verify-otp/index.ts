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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, name, password, role }: VerifyOTPRequest = await req.json();

    if (!email || !otp || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Email, OTP, password, and role are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the OTP from database
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("email_otps")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp_code", otp)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
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
      return new Response(
        JSON.stringify({ error: "OTP has already been used." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("email_otps")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
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
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name,
      },
    });

    if (signUpError) {
      console.error("Error creating user:", signUpError);
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert user role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: role,
      });

    if (roleError) {
      console.error("Error inserting role:", roleError);
      // Try to clean up the user if role insertion fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to set up account. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Delete the OTP record after successful verification
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("id", otpRecord.id);

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
