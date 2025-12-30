-- Add location fields to candidate_education table
ALTER TABLE public.candidate_education
ADD COLUMN IF NOT EXISTS institution_state text,
ADD COLUMN IF NOT EXISTS institution_city text,
ADD COLUMN IF NOT EXISTS institution_pincode text;