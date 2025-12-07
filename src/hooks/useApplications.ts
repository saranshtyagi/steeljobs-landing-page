import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfile } from "./useCandidateProfile";
import { toast } from "sonner";

export type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "hired";

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
  };
}

export const useMyApplications = () => {
  const { user } = useAuth();
  const { profile } = useCandidateProfile();

  return useQuery({
    queryKey: ["myApplications", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          job:jobs(id, title, company_name, location, employment_type, salary_min, salary_max)
        `)
        .eq("candidate_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
    enabled: !!profile?.id,
  });
};

export const useApplyToJob = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) => {
      if (!profile?.id) throw new Error("Please complete your profile first");

      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("candidate_id", profile.id)
        .maybeSingle();

      if (existing) {
        throw new Error("You have already applied to this job");
      }

      const { data, error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          candidate_id: profile.id,
          cover_letter: coverLetter || null,
          status: "applied",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStatus"] });
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      console.error("Apply error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to apply");
    },
  });
};

export const useApplicationStatus = (jobId: string | null) => {
  const { profile } = useCandidateProfile();

  return useQuery({
    queryKey: ["applicationStatus", jobId, profile?.id],
    queryFn: async () => {
      if (!profile?.id || !jobId) return null;

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", jobId)
        .eq("candidate_id", profile.id)
        .maybeSingle();

      if (error) throw error;
      return data as Application | null;
    },
    enabled: !!profile?.id && !!jobId,
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStatus"] });
      toast.success("Application withdrawn");
    },
    onError: (error) => {
      console.error("Withdraw error:", error);
      toast.error("Failed to withdraw application");
    },
  });
};
