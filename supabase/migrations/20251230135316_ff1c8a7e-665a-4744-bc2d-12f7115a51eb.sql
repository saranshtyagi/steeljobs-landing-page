-- Add resume_text column to store extracted text for reliable re-parsing
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS resume_text TEXT DEFAULT NULL;