import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useJobById, useSimilarJobs, Job } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useApplyToJob, useApplicationStatus } from "@/hooks/useApplications";
import { useToggleSaveJob, useIsJobSaved } from "@/hooks/useSavedJobs";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  GraduationCap,
  Building2,
  Calendar,
  Users,
  Globe,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Share2,
  ExternalLink,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not disclosed";
  if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L per annum`;
  if (min) return `From ₹${(min / 100000).toFixed(1)}L per annum`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L per annum`;
  return "Not disclosed";
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
  if (!level) return "Any";
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

const formatWorkMode = (mode: string | null | undefined): string => {
  if (!mode) return "On-site";
  const modes: Record<string, string> = {
    onsite: "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };
  return modes[mode] || mode;
};

const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) return diffHours <= 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Similar Job Card Component
const SimilarJobCard = ({ job }: { job: Job }) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <h4 className="font-medium text-foreground line-clamp-1">{job.title}</h4>
      <p className="text-sm text-muted-foreground">{job.company_name}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {job.location}
        </span>
        <span>{formatSalary(job.salary_min, job.salary_max).split(" per")[0]}</span>
      </div>
    </div>
  );
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const { data: job, isLoading, error } = useJobById(id || null);
  const { data: similarJobs } = useSimilarJobs(id || null, job?.skills_required || [], job?.location || "");
  const { profile } = useCandidateProfile();
  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(id || null);
  const { data: isSaved, isLoading: savedLoading } = useIsJobSaved(id || null);
  const applyToJob = useApplyToJob();
  const toggleSaveJob = useToggleSaveJob();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const hasApplied = !!applicationStatus;
  const isHotJob = job && new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const handleQuickApply = async () => {
    if (!user) {
      navigate(`/auth?redirect=/jobs/${id}`);
      return;
    }
    if (role !== "candidate") {
      toast.error("Only candidates can apply to jobs");
      return;
    }
    if (!profile) {
      toast.error("Please complete your profile first");
      navigate("/dashboard/candidate");
      return;
    }
    if (!profile.resume_url) {
      toast.error("Please upload your resume first");
      navigate("/dashboard/candidate");
      return;
    }

    await applyToJob.mutateAsync({ jobId: id! });
  };

  const handleApplyWithCover = async () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }

    await applyToJob.mutateAsync({ jobId: id!, coverLetter });
    setCoverLetter("");
    setShowApplyModal(false);
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate(`/auth?redirect=/jobs/${id}`);
      return;
    }
    if (role !== "candidate") {
      toast.error("Only candidates can save jobs");
      return;
    }
    await toggleSaveJob.mutateAsync(id!);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Job not found</h2>
            <p className="text-muted-foreground mb-4">This job may have been removed or doesn't exist.</p>
            <Button variant="hero" onClick={() => navigate("/jobs")}>
              Browse Jobs
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${job.title} at ${job.company_name} | SteelJobs.com`}
        description={`Apply for ${job.title} position at ${job.company_name} in ${job.location}. ${job.description.substring(0, 150)}...`}
        keywords={`${job.title}, ${job.company_name}, ${job.location}, ${job.skills_required?.join(", ") || "jobs"}`}
        canonicalUrl={`https://steeljobs.com/jobs/${job.id}`}
        ogType="article"
      />
      <Navbar />

      <main className="flex-1 container-narrow py-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </Button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Job Header */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                  {job.recruiter?.company_logo_url ? (
                    <img src={job.recruiter.company_logo_url} alt={job.company_name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    job.company_name.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                        {isHotJob && (
                          <Badge variant="destructive" className="gap-1">
                            <Flame className="w-3 h-3" />
                            Hot Job
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4" />
                        {job.company_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleSave}
                        disabled={toggleSaveJob.isPending || savedLoading}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-primary" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      {(job.experience_min || 0)}-{job.experience_max || "10+"}yrs
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      {formatSalary(job.salary_min, job.salary_max).split(" per")[0]}
                    </span>
                    {job.work_mode && (
                      <Badge variant="outline">
                        {formatWorkMode(job.work_mode)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {formatEmploymentType(job.employment_type)}
                    </Badge>
                  </div>

                  {/* Posted Time */}
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Posted {getTimeAgo(job.created_at)}
                  </p>
                </div>
              </div>

              {/* Applied Status */}
              {hasApplied && (
                <div className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg mt-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">You've applied to this job</p>
                    <p className="text-sm text-green-600 dark:text-green-500 capitalize">Status: {applicationStatus?.status?.replace("_", " ")}</p>
                  </div>
                </div>
              )}

              {/* Apply Actions */}
              {!hasApplied && (
                <div className="flex gap-3 mt-6">
                  <Button variant="hero" size="lg" onClick={handleQuickApply} disabled={applyToJob.isPending}>
                    {applyToJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Quick Apply
                  </Button>
                  <Button variant="heroOutline" size="lg" onClick={() => setShowApplyModal(true)}>
                    Apply with Cover Letter
                  </Button>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Experience</p>
                  <p className="font-medium text-foreground">{(job.experience_min || 0)}-{job.experience_max || "10+"}yrs</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Salary</p>
                  <p className="font-medium text-foreground">{formatSalary(job.salary_min, job.salary_max).split(" per")[0]}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Education</p>
                  <p className="font-medium text-foreground">{formatEducation(job.education_required)}</p>
                </div>
                {job.num_positions && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Openings</p>
                    <p className="font-medium text-foreground">{job.num_positions} positions</p>
                  </div>
                )}
                {job.application_deadline && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Apply by</p>
                    <p className="font-medium text-foreground">{new Date(job.application_deadline).toLocaleDateString()}</p>
                  </div>
                )}
                {job.role_category && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-medium text-foreground">{job.role_category}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Company Info */}
            {job.recruiter?.about && (
              <div className="bg-card border border-border rounded-xl p-6 mt-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  About {job.company_name}
                </h3>
                <p className="text-muted-foreground">{job.recruiter.about}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            {/* Similar Jobs */}
            {similarJobs && similarJobs.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 sticky top-4">
                <h3 className="font-semibold text-foreground mb-4">Similar Jobs</h3>
                <div className="space-y-3">
                  {similarJobs.slice(0, 5).map((similar) => (
                    <SimilarJobCard key={similar.id} job={similar} />
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate("/jobs")}>
                  View All Jobs
                </Button>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Apply with Cover Letter Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Cover Letter (Optional)</label>
              <Textarea
                placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleApplyWithCover} disabled={applyToJob.isPending}>
              {applyToJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobDetails;