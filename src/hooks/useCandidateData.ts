import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCandidateProfile } from "./useCandidateProfile";
import { toast } from "sonner";

// Types
export interface CandidateEducation {
  id: string;
  candidate_id: string;
  degree_level: string;
  course: string | null;
  course_type: string | null;
  specialization: string | null;
  university: string | null;
  starting_year: number | null;
  passing_year: number | null;
  grading_system: string | null;
  grade_value: string | null;
  is_highest: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateLanguage {
  id: string;
  candidate_id: string;
  language: string;
  proficiency: string | null;
  can_read: boolean | null;
  can_write: boolean | null;
  can_speak: boolean | null;
  created_at: string;
}

export interface CandidateInternship {
  id: string;
  candidate_id: string;
  company_name: string;
  role: string;
  description: string | null;
  skills_learned: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateProject {
  id: string;
  candidate_id: string;
  title: string;
  description: string | null;
  skills_used: string[] | null;
  github_url: string | null;
  live_url: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateEmployment {
  id: string;
  candidate_id: string;
  company_name: string;
  designation: string;
  department: string | null;
  description: string | null;
  achievements: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  current_salary: number | null;
  notice_period: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateAccomplishment {
  id: string;
  candidate_id: string;
  type: string; // certification, award, leadership
  title: string;
  description: string | null;
  issuing_org: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
  created_at: string;
}

export interface CandidateExam {
  id: string;
  candidate_id: string;
  exam_name: string;
  score: string | null;
  rank: string | null;
  year: number | null;
  created_at: string;
}

// Education Hook
export const useCandidateEducation = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateEducation", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_education")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("is_highest", { ascending: false });
      if (error) throw error;
      return data as CandidateEducation[];
    },
    enabled: !!profile?.id,
  });

  const addEducation = useMutation({
    mutationFn: async (input: Omit<CandidateEducation, "id" | "candidate_id" | "created_at" | "updated_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_education")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEducation"] });
      toast.success("Education added");
    },
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CandidateEducation> & { id: string }) => {
      const { data, error } = await supabase
        .from("candidate_education")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEducation"] });
      toast.success("Education updated");
    },
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_education").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEducation"] });
      toast.success("Education removed");
    },
  });

  return { education: query.data || [], isLoading: query.isLoading, addEducation, updateEducation, deleteEducation };
};

// Languages Hook
export const useCandidateLanguages = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateLanguages", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_languages")
        .select("*")
        .eq("candidate_id", profile.id);
      if (error) throw error;
      return data as CandidateLanguage[];
    },
    enabled: !!profile?.id,
  });

  const addLanguage = useMutation({
    mutationFn: async (input: Omit<CandidateLanguage, "id" | "candidate_id" | "created_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_languages")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateLanguages"] });
      toast.success("Language added");
    },
  });

  const deleteLanguage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_languages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateLanguages"] });
      toast.success("Language removed");
    },
  });

  return { languages: query.data || [], isLoading: query.isLoading, addLanguage, deleteLanguage };
};

// Internships Hook
export const useCandidateInternships = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateInternships", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_internships")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as CandidateInternship[];
    },
    enabled: !!profile?.id,
  });

  const addInternship = useMutation({
    mutationFn: async (input: Omit<CandidateInternship, "id" | "candidate_id" | "created_at" | "updated_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_internships")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateInternships"] });
      toast.success("Internship added");
    },
  });

  const updateInternship = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CandidateInternship> & { id: string }) => {
      const { data, error } = await supabase
        .from("candidate_internships")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateInternships"] });
      toast.success("Internship updated");
    },
  });

  const deleteInternship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_internships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateInternships"] });
      toast.success("Internship removed");
    },
  });

  return { internships: query.data || [], isLoading: query.isLoading, addInternship, updateInternship, deleteInternship };
};

// Projects Hook
export const useCandidateProjects = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateProjects", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_projects")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CandidateProject[];
    },
    enabled: !!profile?.id,
  });

  const addProject = useMutation({
    mutationFn: async (input: Omit<CandidateProject, "id" | "candidate_id" | "created_at" | "updated_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_projects")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProjects"] });
      toast.success("Project added");
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CandidateProject> & { id: string }) => {
      const { data, error } = await supabase
        .from("candidate_projects")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProjects"] });
      toast.success("Project updated");
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProjects"] });
      toast.success("Project removed");
    },
  });

  return { projects: query.data || [], isLoading: query.isLoading, addProject, updateProject, deleteProject };
};

// Employment Hook
export const useCandidateEmployment = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateEmployment", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_employment")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("is_current", { ascending: false });
      if (error) throw error;
      return data as CandidateEmployment[];
    },
    enabled: !!profile?.id,
  });

  const addEmployment = useMutation({
    mutationFn: async (input: Omit<CandidateEmployment, "id" | "candidate_id" | "created_at" | "updated_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_employment")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEmployment"] });
      toast.success("Employment added");
    },
  });

  const updateEmployment = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CandidateEmployment> & { id: string }) => {
      const { data, error } = await supabase
        .from("candidate_employment")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEmployment"] });
      toast.success("Employment updated");
    },
  });

  const deleteEmployment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_employment").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateEmployment"] });
      toast.success("Employment removed");
    },
  });

  return { employment: query.data || [], isLoading: query.isLoading, addEmployment, updateEmployment, deleteEmployment };
};

// Accomplishments Hook
export const useCandidateAccomplishments = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateAccomplishments", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_accomplishments")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CandidateAccomplishment[];
    },
    enabled: !!profile?.id,
  });

  const addAccomplishment = useMutation({
    mutationFn: async (input: Omit<CandidateAccomplishment, "id" | "candidate_id" | "created_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_accomplishments")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateAccomplishments"] });
      toast.success("Accomplishment added");
    },
  });

  const deleteAccomplishment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_accomplishments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateAccomplishments"] });
      toast.success("Accomplishment removed");
    },
  });

  return { accomplishments: query.data || [], isLoading: query.isLoading, addAccomplishment, deleteAccomplishment };
};

// Exams Hook
export const useCandidateExams = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidateExams", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("candidate_exams")
        .select("*")
        .eq("candidate_id", profile.id)
        .order("year", { ascending: false });
      if (error) throw error;
      return data as CandidateExam[];
    },
    enabled: !!profile?.id,
  });

  const addExam = useMutation({
    mutationFn: async (input: Omit<CandidateExam, "id" | "candidate_id" | "created_at">) => {
      if (!profile?.id) throw new Error("No profile");
      const { data, error } = await supabase
        .from("candidate_exams")
        .insert({ ...input, candidate_id: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateExams"] });
      toast.success("Exam added");
    },
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidate_exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateExams"] });
      toast.success("Exam removed");
    },
  });

  return { exams: query.data || [], isLoading: query.isLoading, addExam, deleteExam };
};
