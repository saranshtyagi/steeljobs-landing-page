-- Create enums
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'remote');
CREATE TYPE public.education_level AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'doctorate', 'other');
CREATE TYPE public.application_status AS ENUM ('applied', 'shortlisted', 'rejected', 'hired');

-- Create CandidateProfile table
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT,
  location TEXT,
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  experience_years INTEGER DEFAULT 0,
  education_level education_level,
  about TEXT,
  resume_url TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RecruiterProfile table
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_location TEXT,
  company_logo_url TEXT,
  about TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  salary_min INTEGER,
  salary_max INTEGER,
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER,
  education_required education_level,
  skills_required TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Create SavedJobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Create EmailLogs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_preview TEXT,
  sent_to_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_active ON public.jobs(is_active) WHERE is_active = true;
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_saved_jobs_candidate ON public.saved_jobs(candidate_id);
CREATE INDEX idx_candidate_profiles_skills ON public.candidate_profiles USING GIN(skills);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills_required);

-- Enable Row Level Security
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS for candidate_profiles
CREATE POLICY "Candidates can view their own profile"
ON public.candidate_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Candidates can insert their own profile"
ON public.candidate_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own profile"
ON public.candidate_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view candidate profiles"
ON public.candidate_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter'));

-- RLS for recruiter_profiles
CREATE POLICY "Recruiters can view their own profile"
ON public.recruiter_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can insert their own profile"
ON public.recruiter_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update their own profile"
ON public.recruiter_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view recruiter company info"
ON public.recruiter_profiles FOR SELECT
USING (true);

-- RLS for jobs
CREATE POLICY "Everyone can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true);

CREATE POLICY "Recruiters can view all their jobs"
ON public.jobs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = jobs.recruiter_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = recruiter_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can update their own jobs"
ON public.jobs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = jobs.recruiter_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can delete their own jobs"
ON public.jobs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = jobs.recruiter_id AND user_id = auth.uid()
  )
);

-- RLS for applications
CREATE POLICY "Candidates can view their own applications"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE id = applications.candidate_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Candidates can insert applications"
ON public.applications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE id = candidate_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can view applications for their jobs"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.recruiter_profiles rp ON j.recruiter_id = rp.id
    WHERE j.id = applications.job_id AND rp.user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can update applications for their jobs"
ON public.applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.recruiter_profiles rp ON j.recruiter_id = rp.id
    WHERE j.id = applications.job_id AND rp.user_id = auth.uid()
  )
);

-- RLS for saved_jobs
CREATE POLICY "Candidates can view their saved jobs"
ON public.saved_jobs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE id = saved_jobs.candidate_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Candidates can insert saved jobs"
ON public.saved_jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE id = candidate_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Candidates can delete saved jobs"
ON public.saved_jobs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE id = saved_jobs.candidate_id AND user_id = auth.uid()
  )
);

-- RLS for email_logs
CREATE POLICY "Recruiters can view their email logs"
ON public.email_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = email_logs.recruiter_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recruiters can insert email logs"
ON public.email_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recruiter_profiles
    WHERE id = recruiter_id AND user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at
  BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Storage policies for resumes
CREATE POLICY "Users can upload their own resume"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resume"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resume"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resume"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Recruiters can view candidate resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND 
  public.has_role(auth.uid(), 'recruiter')
);