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
        JSON.stringify({ error: "Resume text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing resume with AI...");
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
            content: `You are an expert resume parser. Extract ALL structured information from the resume text provided.
            Be thorough and extract every piece of professional information you can find.
            Parse dates in YYYY-MM-DD format when possible.
            For experience years, calculate the total based on work history if not explicitly mentioned.
            If a field is not found, leave it as null or empty array.
            Be especially thorough with:
            - Work history (all jobs, internships, freelance work)
            - Education (all degrees, certifications, courses)
            - Skills (technical, soft skills, tools, technologies)
            - Languages known
            - Projects and achievements
            - Certifications and accomplishments`
          },
          {
            role: "user",
            content: `Parse this resume and extract ALL available information comprehensively:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_resume_data",
              description: "Extract comprehensive structured data from a resume",
              parameters: {
                type: "object",
                properties: {
                  name: { 
                    type: "string", 
                    description: "Full name of the candidate" 
                  },
                  headline: { 
                    type: "string", 
                    description: "Professional headline or current job title (e.g., 'Senior Software Engineer at Google')" 
                  },
                  location: { 
                    type: "string", 
                    description: "Location/city mentioned in resume" 
                  },
                  profile_summary: {
                    type: "string",
                    description: "Professional summary, objective, or about section from the resume"
                  },
                  skills: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of ALL technical and soft skills mentioned (programming languages, frameworks, tools, soft skills)" 
                  },
                  experience_years: { 
                    type: "number", 
                    description: "Total years of professional experience (calculate from work history if not explicit)" 
                  },
                  education_level: { 
                    type: "string", 
                    enum: ["high_school", "associate", "bachelor", "master", "doctorate", "other"],
                    description: "Highest education level achieved" 
                  },
                  about: { 
                    type: "string", 
                    description: "Professional summary or objective from the resume" 
                  },
                  work_history: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string", description: "Company name" },
                        role: { type: "string", description: "Job title/designation" },
                        duration: { type: "string", description: "Duration as text (e.g., 'Jan 2020 - Present')" },
                        start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
                        end_date: { type: "string", description: "End date in YYYY-MM-DD format or null if current" },
                        description: { type: "string", description: "Job responsibilities and achievements" },
                        is_current: { type: "boolean", description: "Is this the current job" }
                      },
                      required: ["company", "role"]
                    },
                    description: "List of all work experiences (full-time jobs)"
                  },
                  internships: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string", description: "Company name" },
                        role: { type: "string", description: "Internship title/role" },
                        duration: { type: "string", description: "Duration as text" },
                        description: { type: "string", description: "Internship responsibilities" }
                      },
                      required: ["company", "role"]
                    },
                    description: "List of internships (separate from full-time work)"
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string", description: "Degree name (e.g., 'B.Tech in Computer Science')" },
                        institution: { type: "string", description: "University or college name" },
                        year: { type: "string", description: "Graduation year" },
                        specialization: { type: "string", description: "Major or specialization" },
                        grade: { type: "string", description: "GPA, percentage, or grade" }
                      },
                      required: ["degree", "institution"]
                    },
                    description: "List of all educational qualifications"
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Project name" },
                        description: { type: "string", description: "Project description" },
                        skills_used: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Technologies and skills used in the project" 
                        }
                      },
                      required: ["title"]
                    },
                    description: "List of projects (personal, academic, or professional)"
                  },
                  languages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        language: { type: "string", description: "Language name (e.g., 'English', 'Hindi')" },
                        proficiency: { type: "string", description: "Proficiency level (native, fluent, intermediate, basic)" }
                      },
                      required: ["language"]
                    },
                    description: "Languages known by the candidate"
                  },
                  certifications: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of certifications (e.g., 'AWS Certified Developer', 'PMP')"
                  },
                  accomplishments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Accomplishment or award title" },
                        description: { type: "string", description: "Description of the accomplishment" },
                        issuing_org: { type: "string", description: "Organization that issued the award" }
                      },
                      required: ["title"]
                    },
                    description: "Awards, achievements, publications, patents, etc."
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
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
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
    console.log("Parsed resume data:", JSON.stringify(parsedData, null, 2));

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing resume:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse resume" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
