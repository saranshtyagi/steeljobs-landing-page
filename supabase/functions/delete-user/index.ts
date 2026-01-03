import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Deleting user with ID:", userId);

    // First, get the candidate_profile id if exists
    const { data: candidateProfile } = await supabaseAdmin
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    // Get the recruiter_profile id if exists
    const { data: recruiterProfile } = await supabaseAdmin
      .from("recruiter_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    // Delete candidate-related data if candidate profile exists
    if (candidateProfile) {
      console.log("Deleting candidate-related data for profile:", candidateProfile.id);
      
      // Delete applications
      await supabaseAdmin
        .from("applications")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete saved jobs
      await supabaseAdmin
        .from("saved_jobs")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate education
      await supabaseAdmin
        .from("candidate_education")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate employment
      await supabaseAdmin
        .from("candidate_employment")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate projects
      await supabaseAdmin
        .from("candidate_projects")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate internships
      await supabaseAdmin
        .from("candidate_internships")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate exams
      await supabaseAdmin
        .from("candidate_exams")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate languages
      await supabaseAdmin
        .from("candidate_languages")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate accomplishments
      await supabaseAdmin
        .from("candidate_accomplishments")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete feature requests
      await supabaseAdmin
        .from("feature_requests")
        .delete()
        .eq("candidate_id", candidateProfile.id);

      // Delete candidate profile
      await supabaseAdmin
        .from("candidate_profiles")
        .delete()
        .eq("id", candidateProfile.id);
    }

    // Delete recruiter-related data if recruiter profile exists
    if (recruiterProfile) {
      console.log("Deleting recruiter-related data for profile:", recruiterProfile.id);

      // Get all jobs by this recruiter
      const { data: jobs } = await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("recruiter_id", recruiterProfile.id);

      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(j => j.id);
        
        // Delete applications for these jobs
        await supabaseAdmin
          .from("applications")
          .delete()
          .in("job_id", jobIds);

        // Delete saved jobs for these jobs
        await supabaseAdmin
          .from("saved_jobs")
          .delete()
          .in("job_id", jobIds);

        // Delete jobs
        await supabaseAdmin
          .from("jobs")
          .delete()
          .eq("recruiter_id", recruiterProfile.id);
      }

      // Delete email logs
      await supabaseAdmin
        .from("email_logs")
        .delete()
        .eq("recruiter_id", recruiterProfile.id);

      // Delete recruiter profile
      await supabaseAdmin
        .from("recruiter_profiles")
        .delete()
        .eq("id", recruiterProfile.id);
    }

    // Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    // Delete login logs
    await supabaseAdmin
      .from("login_logs")
      .delete()
      .eq("user_id", userId);

    // Delete activity logs
    await supabaseAdmin
      .from("activity_logs")
      .delete()
      .eq("user_id", userId);

    // Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User deleted successfully:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "User and all related data deleted successfully", userId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-user function:", error);
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