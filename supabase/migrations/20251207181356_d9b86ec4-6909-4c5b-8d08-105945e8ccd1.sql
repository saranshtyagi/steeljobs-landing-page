-- Create extended candidate profile tables

-- Candidate Education table
CREATE TABLE public.candidate_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  degree_level TEXT NOT NULL, -- doctorate, masters, graduation, 12th, 10th, below_10th
  course TEXT,
  course_type TEXT, -- full_time, part_time, distance_learning
  specialization TEXT,
  university TEXT,
  starting_year INTEGER,
  passing_year INTEGER,
  grading_system TEXT,
  grade_value TEXT,
  is_highest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Languages table
CREATE TABLE public.candidate_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT, -- basic, intermediate, fluent, native
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_speak BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Internships table
CREATE TABLE public.candidate_internships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  skills_learned TEXT[],
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Projects table
CREATE TABLE public.candidate_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skills_used TEXT[],
  github_url TEXT,
  live_url TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Employment table
CREATE TABLE public.candidate_employment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT,
  description TEXT,
  achievements TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  notice_period TEXT,
  current_salary INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Accomplishments (certifications, awards, etc.)
CREATE TABLE public.candidate_accomplishments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- certification, award, publication, patent
  title TEXT NOT NULL,
  issuing_org TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Competitive Exams
CREATE TABLE public.candidate_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  score TEXT,
  rank TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to candidate_profiles for extended details
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS work_status TEXT, -- experienced, fresher
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_summary TEXT,
ADD COLUMN IF NOT EXISTS preferred_job_type TEXT[], -- full_time, part_time, internship
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Enable RLS on all new tables
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_employment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_accomplishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_education
CREATE POLICY "Candidates can view their own education" ON public.candidate_education
FOR SELECT USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_education.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Candidates can insert their own education" ON public.candidate_education
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_education.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Candidates can update their own education" ON public.candidate_education
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_education.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Candidates can delete their own education" ON public.candidate_education
FOR DELETE USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_education.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate education" ON public.candidate_education
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_languages
CREATE POLICY "Candidates can manage their own languages" ON public.candidate_languages
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_languages.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate languages" ON public.candidate_languages
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_internships
CREATE POLICY "Candidates can manage their own internships" ON public.candidate_internships
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_internships.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate internships" ON public.candidate_internships
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_projects
CREATE POLICY "Candidates can manage their own projects" ON public.candidate_projects
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_projects.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate projects" ON public.candidate_projects
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_employment
CREATE POLICY "Candidates can manage their own employment" ON public.candidate_employment
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_employment.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate employment" ON public.candidate_employment
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_accomplishments
CREATE POLICY "Candidates can manage their own accomplishments" ON public.candidate_accomplishments
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_accomplishments.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate accomplishments" ON public.candidate_accomplishments
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- RLS Policies for candidate_exams
CREATE POLICY "Candidates can manage their own exams" ON public.candidate_exams
FOR ALL USING (
  EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = candidate_exams.candidate_id AND candidate_profiles.user_id = auth.uid())
);

CREATE POLICY "Recruiters can view candidate exams" ON public.candidate_exams
FOR SELECT USING (has_role(auth.uid(), 'recruiter'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_candidate_education_updated_at
BEFORE UPDATE ON public.candidate_education
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_internships_updated_at
BEFORE UPDATE ON public.candidate_internships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_projects_updated_at
BEFORE UPDATE ON public.candidate_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_employment_updated_at
BEFORE UPDATE ON public.candidate_employment
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();