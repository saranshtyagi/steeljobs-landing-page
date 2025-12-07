import { useMyApplications, useWithdrawApplication, ApplicationStatus } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, MapPin, Building2, Calendar, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MyApplicationsListProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case "hired":
      return "text-green-600 bg-green-100";
    case "shortlisted":
      return "text-blue-600 bg-blue-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-amber-600 bg-amber-100";
  }
};

const formatStatus = (status: ApplicationStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const MyApplicationsList = ({ limit, showViewAll = true, onViewAll }: MyApplicationsListProps) => {
  const { data: applications, isLoading, error } = useMyApplications();
  const withdrawApplication = useWithdrawApplication();

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
        <p className="text-destructive">Failed to load applications</p>
      </div>
    );
  }

  const displayedApplications = limit ? applications?.slice(0, limit) : applications;

  if (!displayedApplications || displayedApplications.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No applications yet</p>
        <p className="text-sm text-muted-foreground mt-1">Start applying to jobs to track your progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedApplications.map((application) => (
        <div
          key={application.id}
          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground font-medium text-sm">
              {application.job?.company_name?.substring(0, 2).toUpperCase() || "JB"}
            </div>
            <div>
              <p className="font-medium text-foreground">{application.job?.title || "Job"}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {application.job?.company_name || "Company"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {application.job?.location || "Location"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
              {formatStatus(application.status)}
            </span>
            {application.status === "applied" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => withdrawApplication.mutate(application.id)}
                disabled={withdrawApplication.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                {withdrawApplication.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}

      {showViewAll && applications && applications.length > (limit || 0) && (
        <Button variant="ghost" className="w-full" onClick={onViewAll}>
          View all {applications.length} applications
        </Button>
      )}
    </div>
  );
};

export default MyApplicationsList;
