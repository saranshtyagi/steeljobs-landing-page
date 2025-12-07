-- Add missing columns to recruiter_profiles
ALTER TABLE public.recruiter_profiles
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add missing columns to jobs
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS num_positions integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS application_deadline date,
ADD COLUMN IF NOT EXISTS screening_questions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS role_category text,
ADD COLUMN IF NOT EXISTS work_mode text DEFAULT 'onsite';

-- Update application_status enum to include more statuses
-- First check if values exist before adding
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_review' AND enumtypid = 'application_status'::regtype) THEN
    ALTER TYPE application_status ADD VALUE 'in_review';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'interview' AND enumtypid = 'application_status'::regtype) THEN
    ALTER TYPE application_status ADD VALUE 'interview';
  END IF;
END$$;