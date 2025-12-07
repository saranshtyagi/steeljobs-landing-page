import { useState, useEffect } from "react";
import { useRecruiterProfile } from "@/hooks/useRecruiterProfile";
import { useRecruiterJobs, JobInput, EmploymentType, EducationLevel, Job } from "@/hooks/useRecruiterJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, X, Plus } from "lucide-react";

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editJob?: Job | null;
}

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
];

const workModes = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const roleCategories = [
  "Software Development",
  "Data Science & Analytics",
  "Product Management",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Human Resources",
  "Finance",
  "Customer Support",
  "Other",
];

const skillSuggestions = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL",
  "AWS", "Docker", "Kubernetes", "Git", "REST API", "GraphQL", "MongoDB",
  "PostgreSQL", "Machine Learning", "Data Analysis", "Agile", "Scrum"
];

const JobPostingModal = ({ isOpen, onClose, editJob }: JobPostingModalProps) => {
  const { profile } = useRecruiterProfile();
  const { createJob, updateJob } = useRecruiterJobs();

  const [formData, setFormData] = useState<JobInput>({
    title: "",
    company_name: "",
    location: "",
    employment_type: "full_time",
    salary_min: null,
    salary_max: null,
    experience_min: 0,
    experience_max: null,
    education_required: null,
    skills_required: [],
    description: "",
    is_active: true,
    num_positions: 1,
    application_deadline: null,
    job_visibility: "public",
    role_category: "",
    work_mode: "onsite",
  });

  const [skillInput, setSkillInput] = useState("");
  const [showSalary, setShowSalary] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title,
        company_name: editJob.company_name,
        location: editJob.location,
        employment_type: editJob.employment_type,
        salary_min: editJob.salary_min,
        salary_max: editJob.salary_max,
        experience_min: editJob.experience_min || 0,
        experience_max: editJob.experience_max,
        education_required: editJob.education_required,
        skills_required: editJob.skills_required || [],
        description: editJob.description,
        is_active: editJob.is_active,
        num_positions: editJob.num_positions,
        application_deadline: editJob.application_deadline,
        job_visibility: editJob.job_visibility || "public",
        role_category: editJob.role_category || "",
        work_mode: editJob.work_mode || "onsite",
      });
    } else if (profile) {
      setFormData((prev) => ({
        ...prev,
        company_name: profile.company_name,
      }));
    }
  }, [editJob, profile, isOpen]);

  const updateField = <K extends keyof JobInput>(field: K, value: JobInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills_required?.includes(trimmed)) {
      updateField("skills_required", [...(formData.skills_required || []), trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField(
      "skills_required",
      formData.skills_required?.filter((s) => s !== skill) || []
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const jobData = {
        ...formData,
        salary_min: showSalary ? formData.salary_min : null,
        salary_max: showSalary ? formData.salary_max : null,
      };

      if (editJob) {
        await updateJob.mutateAsync({ id: editJob.id, ...jobData });
      } else {
        await createJob.mutateAsync(jobData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? "Edit Job" : "Post a New Job"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, India"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select
                value={formData.work_mode || "onsite"}
                onValueChange={(value) => updateField("work_mode", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employment Type *</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) => updateField("employment_type", value as EmploymentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role Category</Label>
              <Select
                value={formData.role_category || ""}
                onValueChange={(value) => updateField("role_category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {roleCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Salary Range</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showSalary}
                  onCheckedChange={setShowSalary}
                />
                <span className="text-sm text-muted-foreground">
                  {showSalary ? "Show on listing" : "Hidden"}
                </span>
              </div>
            </div>

            {showSalary && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Minimum (₹/year)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    placeholder="e.g., 800000"
                    value={formData.salary_min || ""}
                    onChange={(e) => updateField("salary_min", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Maximum (₹/year)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    placeholder="e.g., 1500000"
                    value={formData.salary_max || ""}
                    onChange={(e) => updateField("salary_max", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Experience & Education */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_min">Min Experience (years)</Label>
              <Input
                id="experience_min"
                type="number"
                min="0"
                value={formData.experience_min || 0}
                onChange={(e) => updateField("experience_min", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_max">Max Experience (years)</Label>
              <Input
                id="experience_max"
                type="number"
                min="0"
                placeholder="Optional"
                value={formData.experience_max || ""}
                onChange={(e) => updateField("experience_max", e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Education Required</Label>
              <Select
                value={formData.education_required || ""}
                onValueChange={(value) => updateField("education_required", value as EducationLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill(skillInput)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.skills_required && formData.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills_required.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {skillSuggestions
                .filter((s) => !formData.skills_required?.includes(s))
                .slice(0, 8)
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, requirements, and what the ideal candidate looks like..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={8}
              required
            />
          </div>

          {/* Additional Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_positions">Number of Positions</Label>
              <Input
                id="num_positions"
                type="number"
                min="1"
                value={formData.num_positions || 1}
                onChange={(e) => updateField("num_positions", parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.application_deadline || ""}
                onChange={(e) => updateField("application_deadline", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Visibility</Label>
              <Select
                value={formData.job_visibility || "public"}
                onValueChange={(value) => updateField("job_visibility", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="link_only">Only via Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Publish Job</p>
              <p className="text-sm text-muted-foreground">
                {formData.is_active
                  ? "Job will be visible to candidates"
                  : "Save as draft (not visible to candidates)"}
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField("is_active", checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editJob ? "Saving..." : "Posting..."}
                </>
              ) : editJob ? (
                "Save Changes"
              ) : (
                "Post Job"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingModal;
