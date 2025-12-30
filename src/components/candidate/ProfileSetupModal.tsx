import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfile, CandidateProfileInput, EducationLevel } from "@/hooks/useCandidateProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<CandidateProfileInput>;
  isEditing?: boolean;
}

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
];

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

const ProfileSetupModal = ({ isOpen, onClose, initialData, isEditing = false }: ProfileSetupModalProps) => {
  const { user, profile: authProfile } = useAuth();
  const { createProfile, updateProfile } = useCandidateProfile();
  
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  
  const [formData, setFormData] = useState<CandidateProfileInput>({
    headline: initialData?.headline || "",
    location: initialData?.location || "",
    expected_salary_min: initialData?.expected_salary_min || null,
    expected_salary_max: initialData?.expected_salary_max || null,
    experience_years: initialData?.experience_years || null,
    education_level: initialData?.education_level || null,
    about: initialData?.about || "",
    resume_url: initialData?.resume_url || null,
    resume_text: null,
    skills: initialData?.skills || [],
  });

  const handleInputChange = (field: keyof CandidateProfileInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills?.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

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

      handleInputChange("resume_url", urlData.publicUrl);
      toast.success("Resume uploaded!");

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
            const parsed = result.data;
            
            setFormData((prev) => ({
              ...prev,
              headline: parsed.headline || prev.headline,
              location: parsed.location || prev.location,
              experience_years: typeof parsed.experience_years === 'number' ? parsed.experience_years : prev.experience_years,
              education_level: parsed.education_level || prev.education_level,
              about: parsed.about || prev.about,
              skills: parsed.skills?.length ? [...new Set([...(prev.skills || []), ...parsed.skills])] : prev.skills,
              resume_text: resumeText, // Store extracted text for reliable re-parsing
            }));
            
            toast.success("Resume parsed! Fields have been auto-filled.");
          }
        } else {
          const errorResult = await response.json().catch(() => ({}));
          console.error("Parse response error:", errorResult);
          toast.info("Resume uploaded. You can fill in details manually.");
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        toast.info("Resume uploaded. You can fill in details manually.");
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

  const handleSubmit = async () => {
    if (isEditing) {
      await updateProfile.mutateAsync(formData);
    } else {
      await createProfile.mutateAsync(formData);
    }
    onClose();
  };

  const totalSteps = 3;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full gradient-bg mx-auto mb-4 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Let's build your profile</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload your resume to auto-fill your information</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
            disabled={isUploading || isParsing}
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            {isUploading || isParsing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  {isParsing ? "Parsing resume..." : "Uploading..."}
                </p>
              </div>
            ) : formData.resume_url ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-10 h-10 text-green-600" />
                <p className="text-sm font-medium text-green-600">Resume uploaded!</p>
                <p className="text-xs text-muted-foreground">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Upload your resume</p>
                <p className="text-xs text-muted-foreground">PDF or Word, max 10MB</p>
              </div>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Senior React Developer"
              value={formData.headline || ""}
              onChange={(e) => handleInputChange("headline", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, CA"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">Experience & Education</h3>
        <p className="text-sm text-muted-foreground mt-1">Help recruiters find you</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            max="50"
            placeholder="e.g., 5"
            value={formData.experience_years ?? ""}
            onChange={(e) => handleInputChange("experience_years", e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Education Level</Label>
          <Select
            value={formData.education_level || ""}
            onValueChange={(value) => handleInputChange("education_level", value as EducationLevel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Expected Salary (Min)</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="e.g., 80000"
              value={formData.expected_salary_min ?? ""}
              onChange={(e) => handleInputChange("expected_salary_min", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax">Expected Salary (Max)</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder="e.g., 120000"
              value={formData.expected_salary_max ?? ""}
              onChange={(e) => handleInputChange("expected_salary_max", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">About You</Label>
          <Textarea
            id="about"
            placeholder="Brief professional summary..."
            value={formData.about || ""}
            onChange={(e) => handleInputChange("about", e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">Your Skills</h3>
        <p className="text-sm text-muted-foreground mt-1">Add skills to get better job matches</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill (e.g., React, Python)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <Button type="button" onClick={addSkill}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-muted/50 rounded-lg">
          {formData.skills && formData.skills.length > 0 ? (
            formData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Profile" : "Complete Your Profile"}</DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${
                s <= step ? "gradient-bg" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={createProfile.isPending || updateProfile.isPending}
            >
              {createProfile.isPending || updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isEditing ? "Save Changes" : "Complete Setup"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupModal;
