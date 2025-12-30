import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, resumeUrl, candidateId } = await req.json();
    
    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Resume text is required. Please upload a valid resume file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (resumeText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: "Resume text is too short. The file may be corrupted or empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing resume with AI...");
    console.log("Resume text length:", resumeText.length);
    console.log("Resume URL:", resumeUrl);
    console.log("Candidate ID:", candidateId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a strict resume parser. Your ONLY job is to extract information that EXPLICITLY exists in the resume text.

CRITICAL RULES:
1. NEVER invent, assume, or hallucinate any data
2. If a field is NOT explicitly mentioned in the resume, return null or empty array
3. Do NOT use default or placeholder values
4. Do NOT infer skills that aren't listed
5. Do NOT calculate experience years unless dates are explicitly provided
6. Extract ONLY what you can directly read from the text

For experience_years:
- Only calculate if work history has explicit dates
- If no dates, return null

For skills:
- Only include skills explicitly listed in the resume
- If no skills section exists, return empty array

For education_level:
- Only set if a degree is explicitly mentioned
- Map to the closest enum value or return null

Be thorough but ACCURATE - it's better to miss something than to invent it.`
          },
          {
            role: "user",
            content: `Parse this resume and extract ONLY information that is EXPLICITLY present. Do NOT invent or assume any values:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_resume_data",
              description: "Extract ONLY explicitly stated data from a resume. Return null/empty for missing fields.",
              parameters: {
                type: "object",
                properties: {
                  name: { 
                    type: ["string", "null"], 
                    description: "Full name - ONLY if explicitly stated" 
                  },
                  headline: { 
                    type: ["string", "null"], 
                    description: "Professional headline or current job title - ONLY if explicitly stated" 
                  },
                  location: { 
                    type: ["string", "null"], 
                    description: "Location/city - ONLY if explicitly mentioned" 
                  },
                  profile_summary: {
                    type: ["string", "null"],
                    description: "Professional summary or objective - ONLY if explicitly written in resume"
                  },
                  skills: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "ONLY skills explicitly listed in resume. Return empty array if none found." 
                  },
                  experience_years: { 
                    type: ["number", "null"], 
                    description: "Total years - ONLY calculate if explicit work dates exist. Return null otherwise." 
                  },
                  education_level: { 
                    type: ["string", "null"], 
                    enum: ["high_school", "associate", "bachelor", "master", "doctorate", "other", null],
                    description: "Highest education - ONLY if explicitly mentioned" 
                  },
                  about: { 
                    type: ["string", "null"], 
                    description: "Professional summary - ONLY if explicitly in resume" 
                  },
                  work_history: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string", description: "Company name" },
                        role: { type: "string", description: "Job title" },
                        duration: { type: ["string", "null"], description: "Duration text if stated" },
                        start_date: { type: ["string", "null"], description: "Start date YYYY-MM-DD if available" },
                        end_date: { type: ["string", "null"], description: "End date YYYY-MM-DD or null if current" },
                        description: { type: ["string", "null"], description: "Job description if stated" },
                        is_current: { type: "boolean", description: "Is current job" }
                      },
                      required: ["company", "role"]
                    },
                    description: "Work experiences - ONLY those explicitly listed"
                  },
                  internships: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        role: { type: "string" },
                        duration: { type: ["string", "null"] },
                        description: { type: ["string", "null"] }
                      },
                      required: ["company", "role"]
                    },
                    description: "Internships - ONLY those explicitly listed as internships"
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string" },
                        institution: { type: "string" },
                        year: { type: ["string", "null"] },
                        specialization: { type: ["string", "null"] },
                        grade: { type: ["string", "null"] }
                      },
                      required: ["degree", "institution"]
                    },
                    description: "Education - ONLY explicitly listed"
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: ["string", "null"] },
                        skills_used: { 
                          type: "array", 
                          items: { type: "string" }
                        }
                      },
                      required: ["title"]
                    },
                    description: "Projects - ONLY explicitly listed"
                  },
                  languages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        language: { type: "string" },
                        proficiency: { type: ["string", "null"] }
                      },
                      required: ["language"]
                    },
                    description: "Languages - ONLY if explicitly stated"
                  },
                  certifications: {
                    type: "array",
                    items: { type: "string" },
                    description: "Certifications - ONLY those explicitly listed"
                  },
                  accomplishments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: ["string", "null"] },
                        issuing_org: { type: ["string", "null"] }
                      },
                      required: ["title"]
                    },
                    description: "Awards/achievements - ONLY explicitly listed"
                  }
                },
                required: ["skills"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_resume_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_resume_data") {
      throw new Error("Invalid AI response format");
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    
    // Clean up the parsed data - ensure no invented values
    const cleanedData = {
      name: parsedData.name || null,
      headline: parsedData.headline || null,
      location: parsedData.location || null,
      profile_summary: parsedData.profile_summary || null,
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experience_years: typeof parsedData.experience_years === 'number' ? parsedData.experience_years : null,
      education_level: parsedData.education_level || null,
      about: parsedData.about || null,
      work_history: Array.isArray(parsedData.work_history) ? parsedData.work_history : [],
      internships: Array.isArray(parsedData.internships) ? parsedData.internships : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
      languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
      accomplishments: Array.isArray(parsedData.accomplishments) ? parsedData.accomplishments : [],
    };
    
    console.log("Cleaned parsed data:", JSON.stringify(cleanedData, null, 2));

    return new Response(
      JSON.stringify({ success: true, data: cleanedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing resume:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse resume. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
