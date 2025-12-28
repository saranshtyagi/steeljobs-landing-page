import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Job, useRecommendedJobs } from "@/hooks/useJobs";
import { useApplyToJob } from "@/hooks/useApplications";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import JobDetailsModal from "./JobDetailsModal";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, MapPin, IndianRupee, Sparkles } from "lucide-react";

interface RecommendedJobsListProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Salary not specified";
  
  const formatAmount = (amount: number): string => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  
  if (min && max) return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  if (min) return `From ₹${formatAmount(min)}`;
  if (max) return `Up to ₹${formatAmount(max)}`;
  return "Salary not specified";
};

const RecommendedJobsList = ({ limit, showViewAll = true, onViewAll }: RecommendedJobsListProps) => {
  const { t } = useTranslation();
  const { data: jobs, isLoading, error, refetch } = useRecommendedJobs();
  const { profile } = useCandidateProfile();
  const applyToJob = useApplyToJob();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t("candidate.recommendations.failedToLoad", "Failed to load recommendations")}</p>
        <Button variant="ghost" onClick={() => refetch()} className="mt-2">
          {t("candidate.jobs.tryAgain", "Try Again")}
        </Button>
      </div>
    );
  }

  const displayedJobs = limit ? jobs?.slice(0, limit) : jobs;

  if (!displayedJobs || displayedJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("candidate.recommendations.noRecommendations", "No job recommendations yet")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {profile 
            ? t("candidate.recommendations.completeProfile", "Complete your profile to get better matches") 
            : t("candidate.recommendations.createProfile", "Create your profile to see recommendations")}
        </p>
      </div>
    );
  }

  const handleQuickApply = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    await applyToJob.mutateAsync({ jobId: job.id });
    refetch();
  };

  return (
    <>
      <div className="space-y-4">
        {displayedJobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setSelectedJob(job)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{job.title}</p>
                  {job.matchScore && job.matchScore > 30 && (
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {t("candidate.recommendations.goodMatch", "Good match")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{job.company_name}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleQuickApply(job, e)}
                disabled={applyToJob.isPending}
              >
                {applyToJob.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("common.apply", "Apply")
                )}
              </Button>
            </div>
          </div>
        ))}

        {showViewAll && jobs && jobs.length > (limit || 0) && (
          <Button variant="ghost" className="w-full" onClick={onViewAll}>
            {t("candidate.recommendations.viewAll", "View all {{count}} recommendations", { count: jobs.length })}
          </Button>
        )}
      </div>

      <JobDetailsModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplySuccess={() => {
          setSelectedJob(null);
          refetch();
        }}
      />
    </>
  );
};

export default RecommendedJobsList;
