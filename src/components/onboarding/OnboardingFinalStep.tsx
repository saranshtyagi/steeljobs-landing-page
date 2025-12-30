import { useState } from "react";
import { OnboardingData } from "@/pages/onboarding/CandidateOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Check, Loader2, Sparkles, X, AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isSaving: boolean;
}

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    console.log("Extracted PDF text length:", fullText.length);
    return fullText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

const OnboardingFinalStep = ({ data, updateData, onComplete, onBack, isSaving }: Props) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showParsedData, setShowParsedData] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      updateData({ resumeUrl: urlData.publicUrl });
      toast.success("Resume uploaded successfully!");

      // Parse resume
      setIsParsing(true);
      
      try {
        let resumeText = "";
        
        if (file.type === "application/pdf") {
          resumeText = await extractTextFromPDF(file);
        } else {
          // For Word documents, read as text
          resumeText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }
        
        console.log("Resume text to parse:", resumeText.substring(0, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ resumeText }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            updateData({ parsedData: result.data });
            
            // Auto-fill data from parsed resume
            const parsed = result.data;
            const updates: Partial<OnboardingData> = {};
            
            if (parsed.name && !data.fullName) updates.fullName = parsed.name;
            if (parsed.location && !data.currentCity) updates.currentCity = parsed.location;
            if (parsed.skills?.length) {
              updates.skills = [...new Set([...data.skills, ...parsed.skills])];
            }
            
            if (Object.keys(updates).length > 0) {
              updateData(updates);
            }
            
            setShowParsedData(true);
            toast.success("Resume parsed! Review the extracted information below.");
          }
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        toast.info("Resume uploaded. You can review and complete your profile manually.");
      } finally {
        setIsParsing(false);
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateData({ skills: data.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="space-y-6">
      {/* Resume Upload Card */}
      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Almost there!</h1>
          <p className="text-muted-foreground mt-2">
            Upload your resume to complete your profile setup
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
              id="resume-upload-final"
              disabled={isUploading || isParsing}
            />
            <label htmlFor="resume-upload-final" className="cursor-pointer">
              {isUploading || isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm font-medium text-foreground">
                    {isParsing ? "Parsing your resume..." : "Uploading..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isParsing ? "Extracting skills, experience, and education" : "Please wait"}
                  </p>
                </div>
              ) : data.resumeUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Resume uploaded successfully!</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to replace with a different file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload your resume</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or Word document, max 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* AI Parsing Notice */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                AI-Powered Resume Parsing
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll automatically extract your skills, experience, and education from your resume 
                to help you complete your profile faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parsed Data Review */}
      {showParsedData && data.parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Information extracted from your resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.parsedData.name && (
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm font-medium">{data.parsedData.name}</p>
              </div>
            )}
            
            {data.parsedData.headline && (
              <div>
                <Label className="text-xs text-muted-foreground">Headline</Label>
                <p className="text-sm font-medium">{data.parsedData.headline}</p>
              </div>
            )}
            
            {data.parsedData.location && (
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="text-sm font-medium">{data.parsedData.location}</p>
              </div>
            )}
            
            {data.parsedData.experience_years !== null && (
              <div>
                <Label className="text-xs text-muted-foreground">Experience</Label>
                <p className="text-sm font-medium">{data.parsedData.experience_years} years</p>
              </div>
            )}
            
            {data.parsedData.skills?.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Skills detected</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.parsedData.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Please review and edit any information if needed. You can always update your profile later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <p className="text-sm font-medium">{data.fullName || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mobile</Label>
              <p className="text-sm font-medium">{data.mobileNumber || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Work Status</Label>
              <p className="text-sm font-medium capitalize">{data.workStatus || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">City</Label>
              <p className="text-sm font-medium">{data.currentCity || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Education</Label>
              <p className="text-sm font-medium">
                {data.course ? `${data.course} in ${data.specialization}` : data.degreeLevel || "-"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">University</Label>
              <p className="text-sm font-medium">{data.university || "-"}</p>
            </div>
          </div>

          {data.skills.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onComplete} 
          disabled={isSaving || !data.resumeUrl}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Completing setup...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete Profile Setup
            </>
          )}
        </Button>
      </div>

      {!data.resumeUrl && (
        <p className="text-sm text-muted-foreground text-center">
          Please upload your resume to complete the setup
        </p>
      )}
    </div>
  );
};

export default OnboardingFinalStep;
