-- Drop the existing check constraint and recreate with the new value
ALTER TABLE public.feature_requests DROP CONSTRAINT IF EXISTS feature_requests_request_type_check;

ALTER TABLE public.feature_requests ADD CONSTRAINT feature_requests_request_type_check 
CHECK (request_type IN ('premium_6_month', 'premium_1_year', 'mock_interview', 'free_trial_1_week'));