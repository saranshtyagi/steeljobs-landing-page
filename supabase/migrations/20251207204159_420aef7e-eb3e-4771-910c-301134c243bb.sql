-- Add performance indexes for frequently filtered/sorted columns

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON public.jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_range ON public.jobs(experience_min, experience_max);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_active_created ON public.jobs(is_active, created_at DESC);

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON public.applications(job_id, status);

-- Candidate profiles indexes
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_location ON public.candidate_profiles(location);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_experience ON public.candidate_profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_salary ON public.candidate_profiles(expected_salary_min, expected_salary_max);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_skills ON public.candidate_profiles USING GIN(skills);

-- Saved jobs indexes
CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id ON public.saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recruiter_id ON public.email_logs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Recruiter profiles index
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON public.recruiter_profiles(user_id);