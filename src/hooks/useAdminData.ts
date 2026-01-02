import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalJobs: number;
  totalApplications: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface UserWithDetails {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  last_login_at: string | null;
  role: string;
}

export interface CandidateInsight {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  has_resume: boolean;
  skills_count: number;
  applications_count: number;
  profile_completion: number;
}

export interface RecruiterInsight {
  id: string;
  company_name: string;
  contact_email: string | null;
  created_at: string;
  jobs_count: number;
  active_jobs_count: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [
        profilesRes,
        candidatesRes,
        recruitersRes,
        jobsRes,
        applicationsRes,
        newTodayRes,
        newWeekRes,
        newMonthRes,
        activeRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("candidate_profiles").select("id", { count: "exact", head: true }),
        supabase.from("recruiter_profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const totalUsers = profilesRes.count || 0;
      const activeUsers = activeRes.count || 0;

      return {
        totalUsers,
        totalCandidates: candidatesRes.count || 0,
        totalRecruiters: recruitersRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalApplications: applicationsRes.count || 0,
        newUsersToday: newTodayRes.count || 0,
        newUsersWeek: newWeekRes.count || 0,
        newUsersMonth: newMonthRes.count || 0,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
      };
    },
  });
};

export const useAdminUsers = (filters?: { role?: string; search?: string }) => {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: async (): Promise<UserWithDetails[]> => {
      // Get all profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      let users = (profiles || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        email: p.email,
        created_at: p.created_at,
        is_active: p.is_active ?? true,
        last_login_at: p.last_login_at,
        role: roleMap.get(p.user_id) || "unknown",
      }));

      // Apply filters
      if (filters?.role && filters.role !== "all") {
        users = users.filter((u) => u.role === filters.role);
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.user_id.toLowerCase().includes(search)
        );
      }

      return users;
    },
  });
};

export const useCandidateInsights = () => {
  return useQuery({
    queryKey: ["admin-candidate-insights"],
    queryFn: async (): Promise<CandidateInsight[]> => {
      const { data: candidates, error } = await supabase
        .from("candidate_profiles")
        .select(`
          id,
          user_id,
          full_name,
          resume_url,
          skills,
          created_at,
          onboarding_completed,
          profile_summary,
          location,
          headline
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles for email
      const userIds = candidates?.map((c) => c.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      const emailMap = new Map(profiles?.map((p) => [p.user_id, p.email]) || []);

      // Get application counts
      const candidateIds = candidates?.map((c) => c.id) || [];
      const { data: applications } = await supabase
        .from("applications")
        .select("candidate_id")
        .in("candidate_id", candidateIds);

      const appCountMap = new Map<string, number>();
      applications?.forEach((a) => {
        appCountMap.set(a.candidate_id, (appCountMap.get(a.candidate_id) || 0) + 1);
      });

      return (candidates || []).map((c) => {
        // Calculate profile completion
        let completion = 0;
        if (c.full_name) completion += 20;
        if (c.resume_url) completion += 25;
        if (c.skills && c.skills.length > 0) completion += 20;
        if (c.profile_summary) completion += 15;
        if (c.location) completion += 10;
        if (c.headline) completion += 10;

        return {
          id: c.id,
          full_name: c.full_name,
          email: emailMap.get(c.user_id) || "",
          created_at: c.created_at,
          has_resume: !!c.resume_url,
          skills_count: c.skills?.length || 0,
          applications_count: appCountMap.get(c.id) || 0,
          profile_completion: completion,
        };
      });
    },
  });
};

export const useRecruiterInsights = () => {
  return useQuery({
    queryKey: ["admin-recruiter-insights"],
    queryFn: async (): Promise<RecruiterInsight[]> => {
      const { data: recruiters, error } = await supabase
        .from("recruiter_profiles")
        .select("id, company_name, contact_email, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get job counts
      const recruiterIds = recruiters?.map((r) => r.id) || [];
      const { data: jobs } = await supabase
        .from("jobs")
        .select("recruiter_id, is_active")
        .in("recruiter_id", recruiterIds);

      const jobCountMap = new Map<string, { total: number; active: number }>();
      jobs?.forEach((j) => {
        const current = jobCountMap.get(j.recruiter_id) || { total: 0, active: 0 };
        current.total += 1;
        if (j.is_active) current.active += 1;
        jobCountMap.set(j.recruiter_id, current);
      });

      return (recruiters || []).map((r) => ({
        id: r.id,
        company_name: r.company_name,
        contact_email: r.contact_email,
        created_at: r.created_at,
        jobs_count: jobCountMap.get(r.id)?.total || 0,
        active_jobs_count: jobCountMap.get(r.id)?.active || 0,
      }));
    },
  });
};

export const useLoginLogs = () => {
  return useQuery({
    queryKey: ["admin-login-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_logs")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useToggleUserStatus = () => {
  const toggleStatus = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("user_id", userId);

    if (error) throw error;
  };

  return { toggleStatus };
};
