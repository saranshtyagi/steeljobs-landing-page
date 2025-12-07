import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRecruiterProfile } from "./useRecruiterProfile";
import { toast } from "sonner";

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  experience_min: number;
  experience_max: number | null;
  education_required: EducationLevel | null;
  skills_required: string[];
  description: string;
  is_active: boolean;
  num_positions: number | null;
  application_deadline: string | null;
  screening_questions: any[] | null;
  job_visibility: string | null;
  role_category: string | null;
  work_mode: string | null;
  created_at: string;
  updated_at: string;
  applications_count?: number;
}

export interface JobInput {
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_min?: number;
  experience_max?: number | null;
  education_required?: EducationLevel | null;
  skills_required?: string[];
  description: string;
  is_active?: boolean;
  num_positions?: number | null;
  application_deadline?: string | null;
  screening_questions?: any[] | null;
  job_visibility?: string | null;
  role_category?: string | null;
  work_mode?: string | null;
}

export const useRecruiterJobs = () => {
  const { profile } = useRecruiterProfile();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["recruiterJobs", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get jobs with application count
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobs || []).map(async (job) => {
          const { count } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          
          return { ...job, applications_count: count || 0 };
        })
      );

      return jobsWithCounts as Job[];
    },
    enabled: !!profile?.id,
  });

  const createJob = useMutation({
    mutationFn: async (input: JobInput) => {
      if (!profile?.id) throw new Error("Please complete your company profile first");

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          recruiter_id: profile.id,
          ...input,
          skills_required: input.skills_required || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success("Job posted successfully!");
    },
    onError: (error) => {
      console.error("Create job error:", error);
      toast.error("Failed to post job");
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, ...input }: Partial<JobInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success("Job updated successfully!");
    },
    onError: (error) => {
      console.error("Update job error:", error);
      toast.error("Failed to update job");
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success("Job deleted");
    },
    onError: (error) => {
      console.error("Delete job error:", error);
      toast.error("Failed to delete job");
    },
  });

  const toggleJobStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success(data.is_active ? "Job reopened" : "Job closed");
    },
    onError: (error) => {
      console.error("Toggle job status error:", error);
      toast.error("Failed to update job status");
    },
  });

  const duplicateJob = useMutation({
    mutationFn: async (jobId: string) => {
      if (!profile?.id) throw new Error("Please complete your company profile first");

      // Fetch the job to duplicate
      const { data: originalJob, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy
      const { id, created_at, updated_at, ...jobData } = originalJob;
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...jobData,
          title: `${jobData.title} (Copy)`,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success("Job duplicated! Edit and publish when ready.");
    },
    onError: (error) => {
      console.error("Duplicate job error:", error);
      toast.error("Failed to duplicate job");
    },
  });

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    createJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    duplicateJob,
    refetch: jobsQuery.refetch,
  };
};

export const useJobApplications = (jobId: string | null) => {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          candidate:candidate_profiles(
            id, full_name, headline, location, skills, experience_years,
            expected_salary_min, expected_salary_max, resume_url, profile_photo_url
          )
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: "applied" | "shortlisted" | "rejected" | "hired" | "in_review" | "interview" }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success("Application status updated");
    },
    onError: (error) => {
      console.error("Update application status error:", error);
      toast.error("Failed to update application status");
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ applicationIds, status }: { applicationIds: string[]; status: "applied" | "shortlisted" | "rejected" | "hired" | "in_review" | "interview" }) => {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .in("id", applicationIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success("Applications updated");
    },
    onError: (error) => {
      console.error("Bulk update error:", error);
      toast.error("Failed to update applications");
    },
  });

  return {
    applications: applicationsQuery.data || [],
    isLoading: applicationsQuery.isLoading,
    error: applicationsQuery.error,
    updateApplicationStatus,
    bulkUpdateStatus,
    refetch: applicationsQuery.refetch,
  };
};
