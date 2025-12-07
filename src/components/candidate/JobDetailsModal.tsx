import { useState } from "react";
import { Job } from "@/hooks/useJobs";
import { useApplyToJob, useApplicationStatus } from "@/hooks/useApplications";
import { useIsJobSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Loader2,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess?: () => void;
}

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not specified";
  if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  return "Not specified";
};

const formatEmploymentType = (type: string): string => {
  const types: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    internship: "Internship",
    remote: "Remote",
  };
  return types[type] || type;
};

const formatEducation = (level: string | null): string => {
  if (!level) return "Not specified";
  const levels: Record<string, string> = {
    high_school: "High School",
    associate: "Associate Degree",
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    doctorate: "Doctorate",
    other: "Other",
  };
  return levels[level] || level;
};

const JobDetailsModal = ({ job, isOpen, onClose, onApplySuccess }: JobDetailsModalProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const { profile } = useCandidateProfile();
  const applyToJob = useApplyToJob();
  const toggleSaveJob = useToggleSaveJob();
  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(job?.id || null);
  const { data: isSaved, isLoading: savedLoading } = useIsJobSaved(job?.id || null);

  if (!job) return null;

  const handleQuickApply = async () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }
    if (!profile.resume_url) {
      toast.error("Please upload your resume first");
      return;
    }

    await applyToJob.mutateAsync({ jobId: job.id });
    onApplySuccess?.();
  };

  const handleApplyWithCover = async () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }

    await applyToJob.mutateAsync({ jobId: job.id, coverLetter });
    setCoverLetter("");
    setShowCoverLetter(false);
    onApplySuccess?.();
  };

  const handleToggleSave = async () => {
    await toggleSaveJob.mutateAsync(job.id);
  };

  const hasApplied = !!applicationStatus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-lg">
                {job.company_name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl">{job.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" />
                  {job.company_name}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>{formatEmploymentType(job.employment_type)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{job.experience_min || 0}+ years</span>
            </div>
          </div>

          {/* Education Required */}
          {job.education_required && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Education:</span>
              <span className="font-medium">{formatEducation(job.education_required)}</span>
            </div>
          )}

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Job Description</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
              {job.description}
            </div>
          </div>

          {/* Cover Letter Section */}
          {showCoverLetter && !hasApplied && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Cover Letter (Optional)</h4>
              <Textarea
                placeholder="Write a brief cover letter..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Application Status */}
          {hasApplied && (
            <div className="flex items-center gap-2 p-4 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">You've applied to this job</p>
                <p className="text-sm text-green-600 capitalize">Status: {applicationStatus?.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleToggleSave}
            disabled={toggleSaveJob.isPending || savedLoading}
          >
            {savedLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4 mr-2 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4 mr-2" />
            )}
            {isSaved ? "Saved" : "Save"}
          </Button>

          <div className="flex-1" />

          {!hasApplied && (
            <>
              {showCoverLetter ? (
                <Button
                  variant="hero"
                  onClick={handleApplyWithCover}
                  disabled={applyToJob.isPending}
                >
                  {applyToJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              ) : (
                <>
                  <Button variant="heroOutline" onClick={() => setShowCoverLetter(true)}>
                    Apply with Cover Letter
                  </Button>
                  <Button variant="hero" onClick={handleQuickApply} disabled={applyToJob.isPending}>
                    {applyToJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Quick Apply
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
