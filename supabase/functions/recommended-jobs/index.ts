import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create a client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the user's token (extract raw JWT from "Bearer <token>")
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth getUser error:", userError);
      return new Response(
        JSON.stringify({
          error: "Invalid token",
          details: userError?.message || "Auth session missing!",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching recommendations for user:", user.id);

    // Get candidate profile
    const { data: candidateProfile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw profileError;
    }

    // Get all active jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        *,
        recruiter:recruiter_profiles(company_name, company_logo_url)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Jobs error:", jobsError);
      throw jobsError;
    }

    if (!allJobs || allJobs.length === 0) {
      return new Response(
        JSON.stringify({ jobs: [], message: "No jobs available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no candidate profile, return all jobs sorted by date
    if (!candidateProfile) {
      console.log("No candidate profile, returning all jobs");
      return new Response(
        JSON.stringify({ jobs: allJobs.slice(0, 10) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Score and rank jobs based on candidate profile
    const scoredJobs = allJobs.map(job => {
      let score = 0;

      // Skill matching (highest weight)
      if (candidateProfile.skills && job.skills_required) {
        const candidateSkills = candidateProfile.skills.map((s: string) => s.toLowerCase());
        const jobSkills = job.skills_required.map((s: string) => s.toLowerCase());
        const matchingSkills = candidateSkills.filter((s: string) => 
          jobSkills.some((js: string) => js.includes(s) || s.includes(js))
        );
        score += matchingSkills.length * 20;
      }

      // Location matching
      if (candidateProfile.location && job.location) {
        const candidateLoc = candidateProfile.location.toLowerCase();
        const jobLoc = job.location.toLowerCase();
        if (jobLoc.includes(candidateLoc) || candidateLoc.includes(jobLoc) || jobLoc === "remote") {
          score += 15;
        }
      }

      // Experience matching
      if (candidateProfile.experience_years !== null && candidateProfile.experience_years !== undefined) {
        const exp = candidateProfile.experience_years;
        const minExp = job.experience_min || 0;
        const maxExp = job.experience_max || 99;
        if (exp >= minExp && exp <= maxExp) {
          score += 10;
        } else if (exp >= minExp - 1 && exp <= maxExp + 2) {
          score += 5;
        }
      }

      // Salary matching
      if (candidateProfile.expected_salary_min && job.salary_max) {
        if (job.salary_max >= candidateProfile.expected_salary_min) {
          score += 10;
        }
      }
      if (candidateProfile.expected_salary_max && job.salary_min) {
        if (job.salary_min <= candidateProfile.expected_salary_max) {
          score += 5;
        }
      }

      // Education matching
      if (candidateProfile.education_level && job.education_required) {
        const eduOrder = ["high_school", "associate", "bachelor", "master", "doctorate"];
        const candidateEduIndex = eduOrder.indexOf(candidateProfile.education_level);
        const jobEduIndex = eduOrder.indexOf(job.education_required);
        if (candidateEduIndex >= jobEduIndex) {
          score += 5;
        }
      }

      return { ...job, matchScore: score };
    });

    // Sort by score (descending) then by date
    scoredJobs.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    console.log("Returning", scoredJobs.length, "recommendations");

    return new Response(
      JSON.stringify({ jobs: scoredJobs.slice(0, 20) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch recommendations" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
