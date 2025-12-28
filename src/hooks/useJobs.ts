import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type SortOption = "relevance" | "newest" | "salary_high" | "salary_low";

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  experience_min: number | null;
  experience_max: number | null;
  education_required: EducationLevel | null;
  skills_required: string[];
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  work_mode?: string | null;
  role_category?: string | null;
  num_positions?: number | null;
  application_deadline?: string | null;
  recruiter?: {
    company_name: string;
    company_logo_url: string | null;
    about?: string | null;
  };
  matchScore?: number;
}

export interface JobFilters {
  keywords?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  employmentTypes?: EmploymentType[];
  workModes?: WorkMode[];
  educationLevels?: EducationLevel[];
  postedWithin?: "24h" | "7d" | "30d";
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

export const useRecommendedJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recommendedJobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("recommended-jobs", {
        method: "POST",
      });

      // If the session was revoked/expired, sign out locally to stop loops
      if (error) {
        const message = (error as any)?.message || "Failed to fetch recommendations";
        const status = (error as any)?.context?.status;
        if (status === 401) {
          await supabase.auth.signOut();
        }
        throw new Error(message);
      }

      return (data?.jobs || []) as Job[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useAllJobs = () => {
  return useQuery({
    queryKey: ["allJobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useFilteredJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ["filteredJobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url)
        `, { count: "exact" })
        .eq("is_active", true);

      // Keywords filter (title, company, skills)
      if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase();
        query = query.or(`title.ilike.%${keywords}%,company_name.ilike.%${keywords}%,skills_required.cs.{${keywords}}`);
      }

      // Location filter
      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      // Salary filters
      if (filters.salaryMin) {
        query = query.gte("salary_max", filters.salaryMin);
      }
      if (filters.salaryMax) {
        query = query.lte("salary_min", filters.salaryMax);
      }

      // Experience filters
      if (filters.experienceMin !== undefined) {
        query = query.lte("experience_min", filters.experienceMin);
      }
      if (filters.experienceMax !== undefined) {
        query = query.or(`experience_max.is.null,experience_max.gte.${filters.experienceMax}`);
      }

      // Employment type filter
      if (filters.employmentTypes && filters.employmentTypes.length > 0) {
        query = query.in("employment_type", filters.employmentTypes);
      }

      // Work mode filter
      if (filters.workModes && filters.workModes.length > 0) {
        query = query.in("work_mode", filters.workModes);
      }

      // Education filter
      if (filters.educationLevels && filters.educationLevels.length > 0) {
        query = query.in("education_required", filters.educationLevels);
      }

      // Posted within filter
      if (filters.postedWithin) {
        const now = new Date();
        let dateThreshold: Date;
        switch (filters.postedWithin) {
          case "24h":
            dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
        query = query.gte("created_at", dateThreshold.toISOString());
      }

      // Sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "salary_high":
          query = query.order("salary_max", { ascending: false, nullsFirst: false });
          break;
        case "salary_low":
          query = query.order("salary_min", { ascending: true, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Pagination
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        jobs: data as Job[],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useSimilarJobs = (jobId: string | null, skills: string[] = [], location: string = "") => {
  return useQuery({
    queryKey: ["similarJobs", jobId, skills, location],
    queryFn: async () => {
      if (!jobId) return [];

      let query = supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url)
        `)
        .eq("is_active", true)
        .neq("id", jobId)
        .limit(5);

      // Try to match by location first
      if (location) {
        query = query.ilike("location", `%${location}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useJobById = (jobId: string | null) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url, about)
        `)
        .eq("id", jobId)
        .single();

      if (error) throw error;
      return data as Job & { recruiter: { company_name: string; company_logo_url: string | null; about: string | null } };
    },
    enabled: !!jobId,
  });
};
