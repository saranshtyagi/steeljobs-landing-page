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
    const { resumeText } = await req.json();
    
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
            content: `You are a resume parser. Extract structured information from the resume text provided.
            Be accurate and only extract information that is explicitly mentioned in the resume.
            If a field is not found, leave it as null or empty array.`
          },
          {
            role: "user",
            content: `Parse this resume and extract the following information:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_resume_data",
              description: "Extract structured data from a resume",
              parameters: {
                type: "object",
                properties: {
                  name: { 
                    type: "string", 
                    description: "Full name of the candidate" 
                  },
                  headline: { 
                    type: "string", 
                    description: "Professional headline or title (e.g., 'Senior Software Engineer')" 
                  },
                  location: { 
                    type: "string", 
                    description: "Location/city mentioned in resume" 
                  },
                  skills: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of technical and soft skills" 
                  },
                  experience_years: { 
                    type: "number", 
                    description: "Total years of professional experience" 
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
                        company: { type: "string" },
                        role: { type: "string" },
                        duration: { type: "string" }
                      }
                    },
                    description: "List of work experiences"
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        degree: { type: "string" },
                        institution: { type: "string" },
                        year: { type: "string" }
                      }
                    },
                    description: "List of educational qualifications"
                  },
                  certifications: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of certifications"
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
    console.log("Parsed resume data:", parsedData);

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
