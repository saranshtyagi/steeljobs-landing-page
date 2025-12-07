-- Allow recruiters to insert applications (for shortlisting candidates)
CREATE POLICY "Recruiters can insert applications for their jobs" 
ON public.applications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM jobs j
    JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
    WHERE j.id = applications.job_id AND rp.user_id = auth.uid()
  )
);