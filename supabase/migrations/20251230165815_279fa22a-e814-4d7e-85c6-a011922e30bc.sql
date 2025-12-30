-- Add updated check constraint with new request types
ALTER TABLE public.feature_requests ADD CONSTRAINT feature_requests_request_type_check 
CHECK (request_type IN ('premium_6_month', 'premium_1_year', 'mock_interview'));