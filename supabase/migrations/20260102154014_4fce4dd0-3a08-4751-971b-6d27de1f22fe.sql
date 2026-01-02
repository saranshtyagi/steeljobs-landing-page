-- Create function to prevent admins from creating candidate profiles
CREATE OR REPLACE FUNCTION public.prevent_admin_candidate_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Admin users cannot create candidate profiles';
  END IF;
  RETURN NEW;
END;
$$;

-- Create function to prevent admins from creating recruiter profiles
CREATE OR REPLACE FUNCTION public.prevent_admin_recruiter_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Admin users cannot create recruiter profiles';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on candidate_profiles
CREATE TRIGGER prevent_admin_candidate_profile_trigger
BEFORE INSERT ON public.candidate_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_candidate_profile();

-- Create trigger on recruiter_profiles
CREATE TRIGGER prevent_admin_recruiter_profile_trigger
BEFORE INSERT ON public.recruiter_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_recruiter_profile();