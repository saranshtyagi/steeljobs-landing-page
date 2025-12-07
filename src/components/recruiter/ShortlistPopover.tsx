import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecruiterJobs } from "@/hooks/useRecruiterJobs";
import { useShortlistCandidate, useBulkShortlist, useCandidateShortlistStatus } from "@/hooks/useShortlistCandidate";
import { UserPlus, Loader2, Briefcase, Check, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShortlistPopoverProps {
  candidateId?: string;
  candidateIds?: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  disabled?: boolean;
}

const ShortlistPopover = ({
  candidateId,
  candidateIds,
  variant = "outline",
  size = "sm",
  disabled = false,
}: ShortlistPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { jobs, isLoading: jobsLoading } = useRecruiterJobs();
  const shortlistMutation = useShortlistCandidate();
  const bulkShortlistMutation = useBulkShortlist();
  const { data: shortlistStatus } = useCandidateShortlistStatus(candidateId);

  const activeJobs = jobs.filter((job) => job.is_active);
  const isBulk = !!candidateIds && candidateIds.length > 0;
  const isSubmitting = shortlistMutation.isPending || bulkShortlistMutation.isPending;

  // Check if candidate is shortlisted to any job
  const shortlistedJobIds = new Set(shortlistStatus?.map((s) => s.job_id) || []);
  const isShortlisted = !isBulk && shortlistedJobIds.size > 0;

  const handleShortlist = async (jobId: string) => {
    setSelectedJobId(jobId);
    
    try {
      if (isBulk) {
        await bulkShortlistMutation.mutateAsync({ candidateIds, jobId });
      } else if (candidateId) {
        await shortlistMutation.mutateAsync({ candidateId, jobId });
      }
      setIsOpen(false);
    } finally {
      setSelectedJobId(null);
    }
  };

  // If candidate is already shortlisted, show a different button state
  if (isShortlisted && !isBulk) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size={size} disabled={disabled} className="text-primary">
            <UserCheck className="w-4 h-4 mr-1" />
            Shortlisted
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm">Shortlisted Jobs</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              This candidate is shortlisted to {shortlistedJobIds.size} job(s)
            </p>
          </div>
          <ScrollArea className="max-h-64">
            <div className="p-2 space-y-1">
              {activeJobs.map((job) => {
                const isJobShortlisted = shortlistedJobIds.has(job.id);
                return (
                  <button
                    key={job.id}
                    onClick={() => !isJobShortlisted && handleShortlist(job.id)}
                    disabled={isSubmitting || isJobShortlisted}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${
                      isJobShortlisted 
                        ? "bg-primary/10 cursor-default" 
                        : "hover:bg-muted disabled:opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{job.company_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={isJobShortlisted ? "default" : "secondary"} className="text-xs">
                            {isJobShortlisted ? "Shortlisted" : `${job.applications_count || 0} applicants`}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{job.location}</span>
                        </div>
                      </div>
                      {selectedJobId === job.id && isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0 mt-1" />
                      ) : isJobShortlisted ? (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      ) : (
                        <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled}>
          <UserPlus className="w-4 h-4 mr-1" />
          {isBulk ? `Shortlist (${candidateIds.length})` : "Shortlist"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm">Shortlist to Job</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBulk
              ? `Select a job to shortlist ${candidateIds.length} candidates`
              : "Select a job to add this candidate to the pipeline"}
          </p>
        </div>

        {jobsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No active job postings</p>
            <p className="text-xs mt-1">Create a job posting first to shortlist candidates</p>
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="p-2 space-y-1">
              {activeJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleShortlist(job.id)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.company_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {job.applications_count || 0} applicants
                        </Badge>
                        <span className="text-xs text-muted-foreground">{job.location}</span>
                      </div>
                    </div>
                    {selectedJobId === job.id && isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0 mt-1" />
                    ) : (
                      <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ShortlistPopover;
