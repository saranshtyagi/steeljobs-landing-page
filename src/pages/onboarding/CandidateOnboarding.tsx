import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Briefcase, GraduationCap, FileText } from "lucide-react";
import OnboardingBasicDetails from "@/components/onboarding/OnboardingBasicDetails";
import OnboardingEducation from "@/components/onboarding/OnboardingEducation";
import OnboardingFinalStep from "@/components/onboarding/OnboardingFinalStep";

export interface OnboardingData {
  // Basic Details
  fullName: string;
  mobileNumber: string;
  workStatus: "experienced" | "fresher" | "";
  currentState: string;
  currentCity: string;
  pincode: string;
  
  // Education Details
  degreeLevel: string;
  course: string;
  courseType: string;
  specialization: string;
  university: string;
  startingYear: number | null;
  passingYear: number | null;
  gradingSystem: string;
  gradeValue: string;
  skills: string[];
  
  // Resume
  resumeUrl: string | null;
  
  // Parsed data
  parsedData: any;
}

const initialData: OnboardingData = {
  fullName: "",
  mobileNumber: "",
  workStatus: "",
  currentState: "",
  currentCity: "",
  pincode: "",
  degreeLevel: "",
  course: "",
  courseType: "",
  specialization: "",
  university: "",
  startingYear: null,
  passingYear: null,
  gradingSystem: "",
  gradeValue: "",
  skills: [],
  resumeUrl: null,
  parsedData: null,
};

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, role } = useAuth();
  const { profile, isLoading, createProfile, updateProfile } = useCandidateProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not a candidate
  useEffect(() => {
    if (role && role !== "candidate") {
      navigate("/dashboard/recruiter");
    }
  }, [role, navigate]);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      navigate("/dashboard/candidate");
    }
  }, [isLoading, profile, navigate]);

  // Prefill name from auth profile
  useEffect(() => {
    if (authProfile?.name && !data.fullName) {
      setData(prev => ({ ...prev, fullName: authProfile.name }));
    }
  }, [authProfile]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleStepComplete = async (step: number) => {
    setIsSaving(true);
    try {
      // Save progress to database
      const profileData: any = {
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        work_status: data.workStatus,
        location: data.currentCity,
        onboarding_step: step + 1,
      };

      if (step >= 2) {
        profileData.education_level = mapDegreeToEducationLevel(data.degreeLevel);
        profileData.skills = data.skills;
      }

      if (step >= 3) {
        profileData.resume_url = data.resumeUrl;
        profileData.onboarding_completed = true;
      }

      if (profile) {
        await updateProfile.mutateAsync(profileData);
      } else {
        await createProfile.mutateAsync(profileData);
      }

      // Save education details if step 2
      if (step >= 2 && data.degreeLevel) {
        await saveEducation();
      }

      setCurrentStep(step + 1);
      
      if (step === 3) {
        toast.success("Profile setup complete!");
        navigate("/dashboard/candidate");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveEducation = async () => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from("candidate_education")
      .upsert({
        candidate_id: profile.id,
        degree_level: data.degreeLevel,
        course: data.course,
        course_type: data.courseType,
        specialization: data.specialization,
        university: data.university,
        starting_year: data.startingYear,
        passing_year: data.passingYear,
        grading_system: data.gradingSystem,
        grade_value: data.gradeValue,
        is_highest: true,
      }, { 
        onConflict: 'candidate_id',
        ignoreDuplicates: false 
      });

    if (error && error.code !== '23505') {
      console.error("Education save error:", error);
    }
  };

  const mapDegreeToEducationLevel = (degree: string) => {
    const mapping: Record<string, string> = {
      "doctorate": "doctorate",
      "masters": "master",
      "graduation": "bachelor",
      "12th": "high_school",
      "10th": "high_school",
      "below_10th": "other",
    };
    return mapping[degree] || "other";
  };

  const steps = [
    { id: 1, title: "Basic details", icon: Briefcase },
    { id: 2, title: "Education", subtitle: "Employers prefer to know about your Education", icon: GraduationCap },
    { id: 3, title: "Last step", icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Progress Steps */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="relative">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 mb-8">
                    {/* Step indicator */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                          currentStep > step.id
                            ? "bg-green-500 border-green-500 text-white"
                            : currentStep === step.id
                            ? "border-primary bg-background text-primary"
                            : "border-muted-foreground/30 bg-background text-muted-foreground/30"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-0.5 h-16 mt-2 transition-colors ${
                            currentStep > step.id ? "bg-green-500" : "bg-muted-foreground/20"
                          }`}
                        />
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className="pt-1">
                      <h3
                        className={`font-medium ${
                          currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {step.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                          {step.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            {currentStep === 1 && (
              <OnboardingBasicDetails
                data={data}
                updateData={updateData}
                onContinue={() => handleStepComplete(1)}
                isSaving={isSaving}
                userName={authProfile?.name || ""}
              />
            )}
            {currentStep === 2 && (
              <OnboardingEducation
                data={data}
                updateData={updateData}
                onContinue={() => handleStepComplete(2)}
                onBack={() => setCurrentStep(1)}
                isSaving={isSaving}
              />
            )}
            {currentStep === 3 && (
              <OnboardingFinalStep
                data={data}
                updateData={updateData}
                onComplete={() => handleStepComplete(3)}
                onBack={() => setCurrentStep(2)}
                isSaving={isSaving}
              />
            )}
          </div>

          {/* Right Sidebar - Benefits (only on step 1) */}
          {currentStep === 1 && (
            <div className="hidden xl:block w-80 flex-shrink-0">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 text-primary">
                      <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.2" />
                      <circle cx="50" cy="35" r="12" fill="currentColor" opacity="0.3" />
                      <path d="M30 85 Q50 60 70 85" stroke="currentColor" strokeWidth="3" fill="none" />
                      <circle cx="70" cy="20" r="6" fill="hsl(var(--destructive))" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-4">On registering, you can</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Build your profile and let recruiters find you
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Get job postings delivered right to your email
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Find a job and grow your career
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;
