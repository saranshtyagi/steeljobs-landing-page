-- Add premium access column to recruiter_profiles
ALTER TABLE public.recruiter_profiles 
ADD COLUMN has_premium_access boolean NOT NULL DEFAULT false;