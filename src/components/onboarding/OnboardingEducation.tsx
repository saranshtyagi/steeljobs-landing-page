import { useState } from "react";
import { OnboardingData } from "@/pages/onboarding/CandidateOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, X } from "lucide-react";
import { useCollegeSearch, POPULAR_UNIVERSITIES } from "@/hooks/useCollegeSearch";

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
  { value: "cgpa_10", label: "Scale 10 Grading System", placeholder: "Enter CGPA (out of 10)", max: "10" },
  { value: "cgpa_4", label: "Scale 4 Grading System", placeholder: "Enter GPA (out of 4)", max: "4" },
  { value: "percentage", label: "% Marks of 100 Maximum", placeholder: "Enter Percentage", max: "100" },
  { value: "pass", label: "Course Requires a Pass", placeholder: "", max: "" },
];

const SKILL_SUGGESTIONS = [
  "JavaScript", "React", "Python", "Java", "Node.js", "SQL",
  "TypeScript", "HTML/CSS", "Git", "AWS", "Docker", "MongoDB",
  "Machine Learning", "Data Analysis", "Communication", "Problem Solving",
  "Leadership", "Project Management", "Excel", "C++", "C#", ".NET"
];

const OnboardingEducation = ({ data, updateData, onContinue, onBack, isSaving }: Props) => {
  const [educationStep, setEducationStep] = useState(data.degreeLevel ? 2 : 1);
  const [skillInput, setSkillInput] = useState("");
  const [universityInput, setUniversityInput] = useState(data.university || "");
  const [courseInput, setCourseInput] = useState("");
  const [specializationInput, setSpecializationInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUniversitySuggestions, setShowUniversitySuggestions] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  // Use college API search
  const { colleges, isLoading: isLoadingColleges, error: collegeError } = useCollegeSearch(universityInput);

  const currentYear = new Date().getFullYear();
  const startYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const passYears = Array.from({ length: 8 }, (_, i) => currentYear + 4 - i);

  const courseSuggestions = COURSE_SUGGESTIONS[data.degreeLevel] || COURSE_SUGGESTIONS.graduation;

  // Combine API results with popular universities for suggestions
  const universitySuggestions = colleges.length > 0 
    ? colleges.map(c => c.college)
    : POPULAR_UNIVERSITIES.filter(u => 
        !universityInput || u.toLowerCase().includes(universityInput.toLowerCase())
      );

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
      if (data.gradingSystem && data.gradingSystem !== "pass" && !data.gradeValue) {
        newErrors.gradeValue = "Please enter your grade/marks";
      }
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
              <div className="relative">
                <Input
                  placeholder="Type or select your course (e.g., B.Tech, BCA)"
                  value={courseInput || data.course}
                  onChange={(e) => {
                    setCourseInput(e.target.value);
                    updateData({ course: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && courseInput.trim()) {
                      e.preventDefault();
                      updateData({ course: courseInput.trim() });
                    }
                  }}
                  className={errors.course ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {courseSuggestions.map((course) => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => {
                        updateData({ course });
                        setCourseInput(course);
                      }}
                      className={`px-3 py-1.5 rounded-full border transition-colors text-sm ${
                        data.course === course
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
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
              <div className="relative">
                <Input
                  placeholder="Type or select your specialization (e.g., Computer Science)"
                  value={specializationInput || data.specialization}
                  onChange={(e) => {
                    setSpecializationInput(e.target.value);
                    updateData({ specialization: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && specializationInput.trim()) {
                      e.preventDefault();
                      updateData({ specialization: specializationInput.trim() });
                    }
                  }}
                  className={errors.specialization ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATION_SUGGESTIONS.slice(0, 6).map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        updateData({ specialization: spec });
                        setSpecializationInput(spec);
                      }}
                      className={`px-3 py-1.5 rounded-full border transition-colors text-xs ${
                        data.specialization === spec
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              {errors.specialization && (
                <p className="text-sm text-destructive">{errors.specialization}</p>
              )}
            </div>

            {/* University - with API search */}
            <div className="space-y-3">
              <Label className="text-foreground">
                University / Institute<span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Search for your university or college"
                  value={universityInput}
                  onChange={(e) => {
                    setUniversityInput(e.target.value);
                    updateData({ university: e.target.value });
                    setShowUniversitySuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowUniversitySuggestions(universityInput.length > 0 || true)}
                  onBlur={() => setTimeout(() => setShowUniversitySuggestions(false), 200)}
                  className={`pr-10 ${errors.university ? "border-destructive" : ""}`}
                />
                {isLoadingColleges ? (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                
                {/* University Suggestions Dropdown */}
                {showUniversitySuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {collegeError && (
                      <p className="px-4 py-2 text-xs text-muted-foreground">{collegeError}</p>
                    )}
                    {isLoadingColleges && (
                      <div className="px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching colleges...
                      </div>
                    )}
                    {!isLoadingColleges && universitySuggestions.slice(0, 15).map((uni, index) => (
                      <button
                        key={`${uni}-${index}`}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setUniversityInput(uni);
                          updateData({ university: uni });
                          setShowUniversitySuggestions(false);
                        }}
                      >
                        {uni}
                      </button>
                    ))}
                    {universityInput.trim() && !universitySuggestions.some(u => u.toLowerCase() === universityInput.toLowerCase()) && (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors text-primary flex items-center gap-2 border-t border-border"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          updateData({ university: universityInput.trim() });
                          setShowUniversitySuggestions(false);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Use "{universityInput.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Start typing to search from 43,000+ Indian colleges, or enter your institution name
              </p>
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
              <div className="flex flex-wrap gap-2">
                {GRADING_SYSTEMS.map((system) => (
                  <button
                    key={system.value}
                    type="button"
                    onClick={() => updateData({ gradingSystem: system.value, gradeValue: "" })}
                    className={`px-3 py-1.5 rounded-full border transition-colors text-sm ${
                      data.gradingSystem === system.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {system.label}
                  </button>
                ))}
              </div>
              {errors.gradingSystem && (
                <p className="text-sm text-destructive">{errors.gradingSystem}</p>
              )}
            </div>

            {/* Grade Value - shows after grading system selection */}
            {data.gradingSystem && data.gradingSystem !== "pass" && (
              <div className="space-y-2">
                <Label className="text-foreground">
                  {GRADING_SYSTEMS.find(g => g.value === data.gradingSystem)?.placeholder || "Enter Grade"}<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder={GRADING_SYSTEMS.find(g => g.value === data.gradingSystem)?.placeholder || "Enter your grade"}
                  value={data.gradeValue}
                  onChange={(e) => updateData({ gradeValue: e.target.value })}
                  type="number"
                  step="0.01"
                  min="0"
                  max={GRADING_SYSTEMS.find(g => g.value === data.gradingSystem)?.max || "100"}
                  className={errors.gradeValue ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  {data.gradingSystem === "cgpa_10" && "Enter your CGPA on a scale of 10 (e.g., 8.5)"}
                  {data.gradingSystem === "cgpa_4" && "Enter your GPA on a scale of 4 (e.g., 3.7)"}
                  {data.gradingSystem === "percentage" && "Enter your percentage marks (e.g., 85)"}
                </p>
                {errors.gradeValue && (
                  <p className="text-sm text-destructive">{errors.gradeValue}</p>
                )}
              </div>
            )}

            {/* Key Skills */}
            <div className="space-y-3">
              <Label className="text-foreground">
                Key skills<span className="text-destructive">*</span>
              </Label>
              
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

              {/* Skills Input */}
              <div className="relative">
                <Input
                  placeholder="Type a skill and press Enter or comma to add"
                  value={skillInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes(",")) {
                      const skills = value.split(",").map(s => s.trim()).filter(s => s);
                      skills.forEach(skill => addSkill(skill));
                    } else {
                      setSkillInput(value);
                      setShowSkillSuggestions(value.length > 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillInput.trim()) {
                      e.preventDefault();
                      addSkill(skillInput.trim());
                      setShowSkillSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                  className={errors.skills ? "border-destructive" : ""}
                />
                
                {/* Filtered Suggestions Dropdown */}
                {showSkillSuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {SKILL_SUGGESTIONS
                      .filter(s => !data.skills.includes(s))
                      .filter(s => !skillInput || s.toLowerCase().includes(skillInput.toLowerCase()))
                      .slice(0, 8)
                      .map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addSkill(skill);
                            setShowSkillSuggestions(false);
                          }}
                        >
                          {skill}
                        </button>
                      ))}
                    {skillInput.trim() && !SKILL_SUGGESTIONS.some(s => s.toLowerCase() === skillInput.toLowerCase()) && (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors text-primary flex items-center gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addSkill(skillInput.trim());
                          setShowSkillSuggestions(false);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add "{skillInput.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Type skills separated by comma or press Enter. You can add any skill you want.
              </p>

              {/* Quick Add Suggestions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick add:</p>
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
