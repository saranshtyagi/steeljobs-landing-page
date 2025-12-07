import { useState } from "react";
import { OnboardingData } from "@/pages/onboarding/CandidateOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Search, Loader2, Plus } from "lucide-react";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onContinue: () => void;
  onBack: () => void;
  isSaving: boolean;
}

const DEGREE_OPTIONS = [
  { value: "doctorate", label: "Doctorate/PhD" },
  { value: "masters", label: "Masters/Post-Graduation" },
  { value: "graduation", label: "Graduation/Diploma" },
  { value: "12th", label: "12th" },
  { value: "10th", label: "10th" },
  { value: "below_10th", label: "Below 10th" },
];

const COURSE_SUGGESTIONS: Record<string, string[]> = {
  graduation: ["B.A", "BCA", "B.B.A/B.M.S", "B.Com", "B.Ed", "B.Pharma", "B.Sc", "B.Tech/B.E.", "LLB", "Diploma"],
  masters: ["M.A", "MCA", "M.B.A", "M.Com", "M.Ed", "M.Pharma", "M.Sc", "M.Tech/M.E.", "LLM", "PG Diploma"],
  doctorate: ["Ph.D", "M.Phil", "Post Doctorate"],
};

const COURSE_TYPE_OPTIONS = ["Full Time", "Part Time", "Distance Learning"];

const SPECIALIZATION_SUGGESTIONS = [
  "Computer Science Engineering", "Information Technology", "Electronics & Communication",
  "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
  "Business Administration", "Finance", "Marketing", "Human Resources",
];

const GRADING_SYSTEMS = [
  "Scale 10 Grading System", "Scale 4 Grading System", 
  "% Marks of 100 Maximum", "Course Requires a Pass"
];

const SKILL_SUGGESTIONS = [
  "Computer Science Faculty", "Assistant Professor", "Computer Engineer",
  "Teacher", "BCA Fresher", "Computer Science Engineer",
  "Computer and Science Teacher", "Professor", "Computer Teacher", 
  "Associate Professor", "Software Developer", "Data Analyst"
];

const OnboardingEducation = ({ data, updateData, onContinue, onBack, isSaving }: Props) => {
  const [educationStep, setEducationStep] = useState(data.degreeLevel ? 2 : 1);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const startYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const passYears = Array.from({ length: 8 }, (_, i) => currentYear + 4 - i);

  const courseSuggestions = COURSE_SUGGESTIONS[data.degreeLevel] || COURSE_SUGGESTIONS.graduation;

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      updateData({ skills: [...data.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    updateData({ skills: data.skills.filter(s => s !== skillToRemove) });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.degreeLevel) {
      newErrors.degreeLevel = "Please select your qualification";
    }
    if (educationStep >= 2) {
      if (!data.course) newErrors.course = "Course is required";
      if (!data.courseType) newErrors.courseType = "Course type is required";
      if (!data.specialization) newErrors.specialization = "Specialization is required";
      if (!data.university) newErrors.university = "University is required";
      if (!data.startingYear) newErrors.startingYear = "Starting year is required";
      if (!data.passingYear) newErrors.passingYear = "Passing year is required";
      if (!data.gradingSystem) newErrors.gradingSystem = "Grading system is required";
      if (data.skills.length === 0) newErrors.skills = "Add at least one skill";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (educationStep === 1 && data.degreeLevel) {
      setEducationStep(2);
    } else if (validate()) {
      onContinue();
    }
  };

  const selectDegree = (value: string) => {
    updateData({ degreeLevel: value });
  };

  const clearDegree = () => {
    updateData({ degreeLevel: "" });
    setEducationStep(1);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Education details</h1>
        <p className="text-muted-foreground mt-2">
          These details help recruiters identify your background
        </p>
      </div>

      <div className="space-y-6">
        {/* Degree Level Selection */}
        <div className="space-y-3">
          <Label className="text-foreground">
            Highest qualification/Degree currently pursuing<span className="text-destructive">*</span>
          </Label>
          
          {data.degreeLevel ? (
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="px-3 py-2 text-sm bg-foreground text-background"
              >
                {DEGREE_OPTIONS.find(d => d.value === data.degreeLevel)?.label}
                <button onClick={clearDegree} className="ml-2 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {DEGREE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectDegree(option.value)}
                  className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {errors.degreeLevel && (
            <p className="text-sm text-destructive">{errors.degreeLevel}</p>
          )}
        </div>

        {/* Show additional fields after degree selection */}
        {educationStep >= 2 && data.degreeLevel && (
          <>
            {/* Course */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Course<span className="text-destructive">*</span>
              </Label>
              {data.course ? (
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-2 text-sm bg-foreground text-background"
                  >
                    {data.course}
                    <button onClick={() => updateData({ course: "" })} className="ml-2 hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Eg. B.Tech"
                    value={data.course}
                    onChange={(e) => updateData({ course: e.target.value })}
                    className={errors.course ? "border-destructive" : ""}
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {courseSuggestions.map((course) => (
                        <button
                          key={course}
                          type="button"
                          onClick={() => updateData({ course })}
                          className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                        >
                          {course}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {errors.course && (
                <p className="text-sm text-destructive">{errors.course}</p>
              )}
            </div>

            {/* Course Type */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Course type<span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {COURSE_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateData({ courseType: type })}
                    className={`px-4 py-2 rounded-full border transition-colors text-sm ${
                      data.courseType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.courseType && (
                <p className="text-sm text-destructive">{errors.courseType}</p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Specialization<span className="text-destructive">*</span>
              </Label>
              {data.specialization ? (
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-2 text-sm bg-foreground text-background"
                  >
                    {data.specialization}
                    <button onClick={() => updateData({ specialization: "" })} className="ml-2 hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Eg. Computer Science"
                    value={data.specialization}
                    onChange={(e) => updateData({ specialization: e.target.value })}
                    className={errors.specialization ? "border-destructive" : ""}
                  />
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_SUGGESTIONS.slice(0, 4).map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => updateData({ specialization: spec })}
                        className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-xs"
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {errors.specialization && (
                <p className="text-sm text-destructive">{errors.specialization}</p>
              )}
            </div>

            {/* University */}
            <div className="space-y-2">
              <Label className="text-foreground">
                University / Institute<span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Eg. National Institute of Technology (NIT)"
                  value={data.university}
                  onChange={(e) => updateData({ university: e.target.value })}
                  className={`pr-10 ${errors.university ? "border-destructive" : ""}`}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {errors.university && (
                <p className="text-sm text-destructive">{errors.university}</p>
              )}
            </div>

            {/* Starting Year */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Starting year<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Eg. 2025"
                type="number"
                value={data.startingYear || ""}
                onChange={(e) => updateData({ startingYear: parseInt(e.target.value) || null })}
                className={errors.startingYear ? "border-destructive" : ""}
              />
              <div className="flex flex-wrap gap-2">
                {startYears.slice(0, 4).map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => updateData({ startingYear: year })}
                    className={`px-4 py-2 rounded-full border transition-colors text-sm ${
                      data.startingYear === year
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              {errors.startingYear && (
                <p className="text-sm text-destructive">{errors.startingYear}</p>
              )}
            </div>

            {/* Passing Year */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Passing year<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Eg. 2025"
                type="number"
                value={data.passingYear || ""}
                onChange={(e) => updateData({ passingYear: parseInt(e.target.value) || null })}
                className={errors.passingYear ? "border-destructive" : ""}
              />
              <div className="flex flex-wrap gap-2">
                {passYears.slice(0, 4).map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => updateData({ passingYear: year })}
                    className={`px-4 py-2 rounded-full border transition-colors text-sm ${
                      data.passingYear === year
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              {errors.passingYear && (
                <p className="text-sm text-destructive">{errors.passingYear}</p>
              )}
            </div>

            {/* Grading System */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Grading System<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Select grading system"
                value={data.gradingSystem}
                onChange={(e) => updateData({ gradingSystem: e.target.value })}
                className={errors.gradingSystem ? "border-destructive" : ""}
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {GRADING_SYSTEMS.map((system) => (
                    <button
                      key={system}
                      type="button"
                      onClick={() => updateData({ gradingSystem: system })}
                      className={`px-3 py-1.5 rounded-full border transition-colors text-sm ${
                        data.gradingSystem === system
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>
              {errors.gradingSystem && (
                <p className="text-sm text-destructive">{errors.gradingSystem}</p>
              )}
            </div>

            {/* Key Skills */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Key skills<span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Key skills are crucial for recruiters to hire you"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput.trim());
                  }
                }}
                rows={3}
                className={errors.skills ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Recruiters look for candidates with specific key skills
              </p>
              
              {/* Selected Skills */}
              {data.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {data.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Skill Suggestions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !data.skills.includes(s)).slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm flex items-center gap-1"
                    >
                      {skill}
                      <Plus className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
              {errors.skills && (
                <p className="text-sm text-destructive">{errors.skills}</p>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save and continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingEducation;
