import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be less than 72 characters");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-()]{7,20}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const urlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL")
  .max(500, "URL must be less than 500 characters")
  .optional()
  .or(z.literal(""));

// Job posting validation
export const jobPostingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  company_name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "remote"]),
  work_mode: z.enum(["onsite", "remote", "hybrid"]).optional(),
  salary_min: z.number().min(0).max(100000000).nullable().optional(),
  salary_max: z.number().min(0).max(100000000).nullable().optional(),
  experience_min: z.number().min(0).max(50).default(0),
  experience_max: z.number().min(0).max(50).nullable().optional(),
  education_required: z.enum(["high_school", "associate", "bachelor", "master", "doctorate", "other"]).nullable().optional(),
  skills_required: z.array(z.string().max(50)).max(20, "Maximum 20 skills allowed").optional(),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(10000, "Description must be less than 10,000 characters"),
  num_positions: z.number().min(1).max(1000).default(1),
  application_deadline: z.string().nullable().optional(),
  job_visibility: z.enum(["public", "link_only"]).default("public"),
  role_category: z.string().max(100).optional(),
  is_active: z.boolean().default(true),
});

// Recruiter profile validation
export const recruiterProfileSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  company_website: urlSchema,
  company_location: z
    .string()
    .trim()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  company_size: z.string().optional(),
  industry: z.string().max(100).optional(),
  about: z
    .string()
    .trim()
    .max(2000, "About must be less than 2,000 characters")
    .optional(),
  contact_name: nameSchema.optional(),
  contact_email: emailSchema.optional().or(z.literal("")),
  contact_phone: phoneSchema,
});

// Candidate profile validation
export const candidateProfileSchema = z.object({
  full_name: nameSchema,
  mobile_number: phoneSchema,
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  headline: z
    .string()
    .trim()
    .max(200, "Headline must be less than 200 characters")
    .optional(),
  about: z
    .string()
    .trim()
    .max(3000, "About must be less than 3,000 characters")
    .optional(),
  experience_years: z.number().min(0).max(50).optional(),
  expected_salary_min: z.number().min(0).max(100000000).optional(),
  expected_salary_max: z.number().min(0).max(100000000).optional(),
  skills: z.array(z.string().max(50)).max(30, "Maximum 30 skills allowed").optional(),
  work_status: z.enum(["fresher", "experienced"]).optional(),
});

// Application validation
export const applicationSchema = z.object({
  job_id: z.string().uuid("Invalid job ID"),
  cover_letter: z
    .string()
    .trim()
    .max(3000, "Cover letter must be less than 3,000 characters")
    .optional(),
});

// Email validation
export const emailSendSchema = z.object({
  recipients: z
    .array(
      z.object({
        email: emailSchema,
        name: z.string().max(100).optional(),
      })
    )
    .min(1, "At least one recipient required")
    .max(100, "Maximum 100 recipients per email"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Message body is required")
    .max(10000, "Message must be less than 10,000 characters"),
  template_id: z.string().optional(),
  job_id: z.string().uuid().optional(),
});

// Search/filter validation
export const jobSearchSchema = z.object({
  keywords: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  salaryMin: z.number().min(0).max(100000000).optional(),
  salaryMax: z.number().min(0).max(100000000).optional(),
  experienceMin: z.number().min(0).max(50).optional(),
  experienceMax: z.number().min(0).max(50).optional(),
  page: z.number().min(1).max(1000).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Helper function to sanitize user input for XSS prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Helper function to validate and sanitize job description
export const sanitizeDescription = (description: string): string => {
  // Allow basic formatting but escape dangerous content
  return description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
};

// Type exports
export type JobPostingInput = z.infer<typeof jobPostingSchema>;
export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type EmailSendInput = z.infer<typeof emailSendSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
