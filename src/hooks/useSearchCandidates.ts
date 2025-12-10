import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";
export type WorkPreference = "full_time" | "part_time" | "internship" | "remote" | "contract";

export interface CandidateSearchFilters {
  keywords?: string;
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  educationLevels?: EducationLevel[];
  skills?: string[];
  workPreferences?: WorkPreference[];
  profileFreshness?: "7d" | "30d" | "90d";
  sortBy?: "relevance" | "experience" | "salary_high" | "salary_low" | "recent";
  page?: number;
  pageSize?: number;
}

export interface CandidateResult {
  id: string;
  user_id: string;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  experience_years: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  education_level: EducationLevel | null;
  skills: string[] | null;
  profile_summary: string | null;
  about: string | null;
  resume_url: string | null;
  profile_photo_url: string | null;
  work_status: string | null;
  preferred_job_type: string[] | null;
  preferred_locations: string[] | null;
  availability: string | null;
  updated_at: string;
  created_at: string;
  // Joined data
  education?: {
    id: string;
    degree_level: string;
    course: string | null;
    university: string | null;
    passing_year: number | null;
    is_highest: boolean | null;
  }[];
  employment?: {
    id: string;
    company_name: string;
    designation: string;
    is_current: boolean | null;
  }[];
  matchScore?: number;
}

export const useSearchCandidates = (filters: CandidateSearchFilters) => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["searchCandidates", filters],
    queryFn: async () => {
      // First, fetch all candidates with basic filters (without keyword search)
      // We'll do keyword filtering client-side for better skill matching
      let query = supabase
        .from("candidate_profiles")
        .select(`
          *,
          education:candidate_education(id, degree_level, course, university, passing_year, is_highest),
          employment:candidate_employment(id, company_name, designation, is_current)
        `, { count: "exact" })
        .eq("onboarding_completed", true);

      // Location filter
      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      // Experience filters
      if (filters.experienceMin !== undefined) {
        query = query.gte("experience_years", filters.experienceMin);
      }
      if (filters.experienceMax !== undefined) {
        query = query.lte("experience_years", filters.experienceMax);
      }

      // Salary filters
      if (filters.salaryMin !== undefined) {
        query = query.gte("expected_salary_max", filters.salaryMin);
      }
      if (filters.salaryMax !== undefined) {
        query = query.lte("expected_salary_min", filters.salaryMax);
      }

      // Education level filter
      if (filters.educationLevels && filters.educationLevels.length > 0) {
        query = query.in("education_level", filters.educationLevels);
      }

      // Skills filter - check if any of the filter skills are in the candidate's skills array
      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps("skills", filters.skills);
      }

      // Work preferences filter
      if (filters.workPreferences && filters.workPreferences.length > 0) {
        query = query.overlaps("preferred_job_type", filters.workPreferences);
      }

      // Profile freshness filter
      if (filters.profileFreshness) {
        const now = new Date();
        let dateThreshold: Date;
        switch (filters.profileFreshness) {
          case "7d":
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
        query = query.gte("updated_at", dateThreshold.toISOString());
      }

      // Sorting
      switch (filters.sortBy) {
        case "experience":
          query = query.order("experience_years", { ascending: false, nullsFirst: false });
          break;
        case "salary_high":
          query = query.order("expected_salary_max", { ascending: false, nullsFirst: false });
          break;
        case "salary_low":
          query = query.order("expected_salary_min", { ascending: true, nullsFirst: false });
          break;
        case "recent":
          query = query.order("updated_at", { ascending: false });
          break;
        default:
          query = query.order("updated_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      let filteredData = data as CandidateResult[];

      // Keywords filter (client-side for better skill matching)
      if (filters.keywords) {
        const keywords = filters.keywords.trim().toLowerCase();
        filteredData = filteredData.filter((candidate) => {
          // Check full_name
          if (candidate.full_name?.toLowerCase().includes(keywords)) return true;
          // Check headline
          if (candidate.headline?.toLowerCase().includes(keywords)) return true;
          // Check about
          if (candidate.about?.toLowerCase().includes(keywords)) return true;
          // Check profile_summary
          if (candidate.profile_summary?.toLowerCase().includes(keywords)) return true;
          // Check skills array - case insensitive partial match
          if (candidate.skills?.some(skill => skill.toLowerCase().includes(keywords))) return true;
          // Check location
          if (candidate.location?.toLowerCase().includes(keywords)) return true;
          return false;
        });
      }

      // Pagination (apply after client-side filtering)
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const totalCount = filteredData.length;
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginatedData = filteredData.slice(from, to);

      // Calculate match scores based on skills overlap
      const candidatesWithScores = paginatedData.map((candidate) => {
        let matchScore = 0;
        
        // Keywords match scoring
        if (filters.keywords && candidate.skills) {
          const keywords = filters.keywords.toLowerCase();
          const matchingSkills = candidate.skills.filter((skill) =>
            skill.toLowerCase().includes(keywords)
          );
          if (matchingSkills.length > 0) matchScore += 30;
        }
        
        // Skills filter match scoring
        if (filters.skills && filters.skills.length > 0 && candidate.skills) {
          const matchingSkills = candidate.skills.filter((skill) =>
            filters.skills!.some((fs) => skill.toLowerCase().includes(fs.toLowerCase()))
          );
          matchScore += (matchingSkills.length / filters.skills.length) * 50;
        }
        
        // Location match scoring
        if (filters.location && candidate.location) {
          if (candidate.location.toLowerCase().includes(filters.location.toLowerCase())) {
            matchScore += 20;
          }
        }
        
        // Experience match scoring
        if (filters.experienceMin !== undefined && candidate.experience_years) {
          if (candidate.experience_years >= filters.experienceMin) {
            matchScore += 15;
          }
        }
        
        // Profile completeness scoring
        if (candidate.resume_url) matchScore += 5;
        if (candidate.profile_summary) matchScore += 5;
        if (candidate.profile_photo_url) matchScore += 5;

        return { ...candidate, matchScore: Math.min(100, Math.round(matchScore)) };
      });

      // Sort by match score if relevance is selected
      if (filters.sortBy === "relevance" || !filters.sortBy) {
        candidatesWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      return {
        candidates: candidatesWithScores,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    },
    enabled: !!user && role === "recruiter",
    staleTime: 1000 * 60 * 2,
  });
};

export const useCandidateById = (candidateId: string | null) => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data: candidate, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (candidateError) throw candidateError;

      // Fetch related data in parallel
      const [educationRes, employmentRes, projectsRes, internshipsRes, languagesRes, accomplishmentsRes, examsRes] =
        await Promise.all([
          supabase
            .from("candidate_education")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("is_highest", { ascending: false }),
          supabase
            .from("candidate_employment")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("is_current", { ascending: false }),
          supabase
            .from("candidate_projects")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("created_at", { ascending: false }),
          supabase
            .from("candidate_internships")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("start_date", { ascending: false }),
          supabase
            .from("candidate_languages")
            .select("*")
            .eq("candidate_id", candidateId),
          supabase
            .from("candidate_accomplishments")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("created_at", { ascending: false }),
          supabase
            .from("candidate_exams")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("year", { ascending: false }),
        ]);

      return {
        ...candidate,
        education: educationRes.data || [],
        employment: employmentRes.data || [],
        projects: projectsRes.data || [],
        internships: internshipsRes.data || [],
        languages: languagesRes.data || [],
        accomplishments: accomplishmentsRes.data || [],
        exams: examsRes.data || [],
      };
    },
    enabled: !!candidateId && !!user && role === "recruiter",
  });
};