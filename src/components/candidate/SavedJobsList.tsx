import { useState } from "react";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useJobById, Job } from "@/hooks/useJobs";
import JobDetailsModal from "./JobDetailsModal";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark, MapPin, DollarSign, Building2, Trash2 } from "lucide-react";

interface SavedJobsListProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Salary not specified";
  if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
  return "Salary not specified";
};

const SavedJobsList = ({ limit, showViewAll = true, onViewAll }: SavedJobsListProps) => {
  const { data: savedJobs, isLoading, error, refetch } = useSavedJobs();
  const toggleSaveJob = useToggleSaveJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: selectedJob } = useJobById(selectedJobId);

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
        <p className="text-destructive">Failed to load saved jobs</p>
        <Button variant="ghost" onClick={() => refetch()} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  const displayedJobs = limit ? savedJobs?.slice(0, limit) : savedJobs;

  if (!displayedJobs || displayedJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No saved jobs yet</p>
        <p className="text-sm text-muted-foreground mt-1">Save jobs to apply later</p>
      </div>
    );
  }

  const handleRemove = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSaveJob.mutateAsync(jobId);
  };

  return (
    <>
      <div className="space-y-4">
        {displayedJobs.map((savedJob) => (
          <div
            key={savedJob.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer"
            onClick={() => setSelectedJobId(savedJob.job_id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground font-medium text-sm">
                {savedJob.job?.company_name?.substring(0, 2).toUpperCase() || "JB"}
              </div>
              <div>
                <p className="font-medium text-foreground">{savedJob.job?.title || "Job"}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {savedJob.job?.company_name || "Company"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {savedJob.job?.location || "Location"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatSalary(savedJob.job?.salary_min ?? null, savedJob.job?.salary_max ?? null)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleRemove(savedJob.job_id, e)}
                disabled={toggleSaveJob.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                {toggleSaveJob.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        {showViewAll && savedJobs && savedJobs.length > (limit || 0) && (
          <Button variant="ghost" className="w-full" onClick={onViewAll}>
            View all {savedJobs.length} saved jobs
          </Button>
        )}
      </div>

      <JobDetailsModal
        job={selectedJob as Job | null}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJobId(null)}
        onApplySuccess={() => {
          setSelectedJobId(null);
          refetch();
        }}
      />
    </>
  );
};

export default SavedJobsList;
