import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  inviteToken?: string;
  action: "send" | "accept";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin invite function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { email, inviteToken, action }: InviteRequest = await req.json();
    console.log(`Action: ${action}, Email: ${email}`);

    if (action === "send") {
      // Verify the requester is an admin
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header");
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !user) {
        throw new Error("Invalid user token");
      }

      // Check if user is admin
      const { data: adminRole } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!adminRole) {
        throw new Error("Only admins can send invites");
      }

      // Check if email is already an admin
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("user_id")
        .eq("email", email)
        .single();

      if (existingProfile) {
        const { data: existingAdmin } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", existingProfile.user_id)
          .eq("role", "admin")
          .single();

        if (existingAdmin) {
          throw new Error("This user is already an admin");
        }
      }

      // Check for pending invite
      const { data: pendingInvite } = await supabaseClient
        .from("admin_invites")
        .select("id")
        .eq("email", email)
        .eq("status", "pending")
        .single();

      if (pendingInvite) {
        throw new Error("An invite is already pending for this email");
      }

      // Create invite
      const { data: invite, error: inviteError } = await supabaseClient
        .from("admin_invites")
        .insert({
          email,
          invited_by: user.id,
        })
        .select()
        .single();

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        throw new Error("Failed to create invite");
      }

      console.log("Invite created:", invite.id);

      // Get inviter's name
      const { data: inviterProfile } = await supabaseClient
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();

      const inviterName = inviterProfile?.name || "An administrator";
      const acceptUrl = `${req.headers.get("origin") || "https://steeljobs.app"}/auth?invite=${invite.token}`;

      // Send email
      const emailResponse = await resend.emails.send({
        from: "SteelJobs Admin <noreply@mail.mysteeljobs.com>",
        to: [email],
        subject: "You've been invited as an Admin on SteelJobs",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Admin Invitation</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName}</strong> has invited you to become an administrator on SteelJobs.
              </p>
              <p style="font-size: 14px; color: #64748b; margin-bottom: 25px;">
                As an admin, you'll have access to the admin panel to manage users, view analytics, and oversee platform operations.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" style="background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 25px;">
                This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
              © SteelJobs - Steel Industry Job Portal
            </p>
          </body>
          </html>
        `,
      });

      console.log("Email sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Invite sent successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (action === "accept") {
      if (!inviteToken) {
        throw new Error("Invite token is required");
      }

      // Find and validate invite
      const { data: invite, error: inviteError } = await supabaseClient
        .from("admin_invites")
        .select("*")
        .eq("token", inviteToken)
        .eq("status", "pending")
        .single();

      if (inviteError || !invite) {
        throw new Error("Invalid or expired invitation");
      }

      if (new Date(invite.expires_at) < new Date()) {
        await supabaseClient
          .from("admin_invites")
          .update({ status: "expired" })
          .eq("id", invite.id);
        throw new Error("This invitation has expired");
      }

      // Check if user exists
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("user_id")
        .eq("email", invite.email)
        .single();

      if (existingProfile) {
        const userId = existingProfile.user_id;

        // Delete candidate profile if exists
        const { error: candError } = await supabaseClient
          .from("candidate_profiles")
          .delete()
          .eq("user_id", userId);
        
        if (candError) {
          console.log("No candidate profile to delete or error:", candError.message);
        } else {
          console.log("Deleted candidate profile for user:", userId);
        }

        // Delete recruiter profile if exists
        const { error: recError } = await supabaseClient
          .from("recruiter_profiles")
          .delete()
          .eq("user_id", userId);
        
        if (recError) {
          console.log("No recruiter profile to delete or error:", recError.message);
        } else {
          console.log("Deleted recruiter profile for user:", userId);
        }

        // Remove existing roles
        await supabaseClient
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Add admin role
        const { error: roleError } = await supabaseClient
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (roleError) {
          console.error("Error adding admin role:", roleError);
          throw new Error("Failed to grant admin role");
        }

        console.log("Admin role granted to existing user:", userId);

        // Mark invite as accepted
        await supabaseClient
          .from("admin_invites")
          .update({ status: "accepted", accepted_at: new Date().toISOString() })
          .eq("id", invite.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Admin role granted. Previous profiles have been removed.",
            existingUser: true,
            email: invite.email
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // User doesn't exist - return info for signup flow
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Valid invite. Please sign up to continue.",
            existingUser: false,
            email: invite.email,
            inviteId: invite.id
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    throw new Error("Invalid action");

  } catch (error: any) {
    console.error("Error in admin-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
