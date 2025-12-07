import { useState } from "react";
import { Job, useJobApplications } from "@/hooks/useRecruiterJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  DollarSign,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface JobDetailViewProps {
  job: Job;
  onBack: () => void;
  onEdit: () => void;
}

type ApplicationStatus = "applied" | "in_review" | "shortlisted" | "interview" | "hired" | "rejected";

const applicationStatuses: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "applied", label: "Applied", color: "bg-amber-100 text-amber-700" },
  { value: "in_review", label: "In Review", color: "bg-blue-100 text-blue-700" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-purple-100 text-purple-700" },
  { value: "interview", label: "Interview", color: "bg-indigo-100 text-indigo-700" },
  { value: "hired", label: "Hired", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

const JobDetailView = ({ job, onBack, onEdit }: JobDetailViewProps) => {
  const { applications, isLoading, updateApplicationStatus, bulkUpdateStatus } = useJobApplications(job.id);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApplications((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (status: ApplicationStatus) => {
    if (selectedApplications.length > 0) {
      bulkUpdateStatus.mutate({ applicationIds: selectedApplications, status });
      setSelectedApplications([]);
    }
  };

  const getStatusStyle = (status: string) => {
    return applicationStatuses.find((s) => s.value === status)?.color || "bg-muted text-muted-foreground";
  };

  const formatSalary = (min: number | null, max: number | null): string => {
    if (!min && !max) return "Not specified";
    if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
    if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
    if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
    return "Not specified";
  };

  // Stats
  const stats = applicationStatuses.map((status) => ({
    ...status,
    count: applications.filter((a) => a.status === status.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <Badge variant={job.is_active ? "default" : "secondary"}>
              {job.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit}>
          Edit Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              statusFilter === stat.value ? "border-primary bg-primary/5" : "border-border"
            }`}
            onClick={() => setStatusFilter(statusFilter === stat.value ? "all" : stat.value)}
          >
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applicants" className="w-full">
        <TabsList>
          <TabsTrigger value="applicants" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Applicants ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Job Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="mt-6">
          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedApplications.length} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("shortlisted")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("rejected")}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applicants</SelectItem>
                {applicationStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {applications.length === 0
                  ? "No applications yet"
                  : "No applications match this filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox
                  checked={
                    selectedApplications.length === filteredApplications.length &&
                    filteredApplications.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>

              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <Checkbox
                    checked={selectedApplications.includes(application.id)}
                    onCheckedChange={() => toggleSelect(application.id)}
                  />

                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {application.candidate?.profile_photo_url ? (
                      <img
                        src={application.candidate.profile_photo_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {application.candidate?.full_name || "Candidate"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.candidate?.headline || "No headline"}
                        </p>
                      </div>
                      <Badge className={getStatusStyle(application.status)}>
                        {applicationStatuses.find((s) => s.value === application.status)?.label ||
                          application.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {application.candidate?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {application.candidate.location}
                        </span>
                      )}
                      {application.candidate?.experience_years !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {application.candidate?.experience_years || 0} years exp
                        </span>
                      )}
                      {(application.candidate?.expected_salary_min ||
                        application.candidate?.expected_salary_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatSalary(
                            application.candidate?.expected_salary_min || null,
                            application.candidate?.expected_salary_max || null
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {application.candidate?.skills && application.candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {application.candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {application.candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.candidate.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {application.candidate?.resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.candidate?.resume_url, "_blank")}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Select
                      value={application.status}
                      onValueChange={(value: ApplicationStatus) =>
                        updateApplicationStatus.mutate({
                          applicationId: application.id,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {/* Job Meta */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="font-medium text-foreground capitalize">
                    {job.employment_type.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-medium text-foreground">
                    {job.experience_min || 0}
                    {job.experience_max ? ` - ${job.experience_max}` : "+"} years
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-medium text-foreground">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="font-medium text-foreground capitalize">
                    {job.education_required?.replace("_", " ") || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Required Skills</h4>
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
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Job Description</h4>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              {job.num_positions && (
                <div>
                  <p className="text-xs text-muted-foreground">Positions</p>
                  <p className="font-medium text-foreground">{job.num_positions}</p>
                </div>
              )}
              {job.application_deadline && (
                <div>
                  <p className="text-xs text-muted-foreground">Application Deadline</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(job.application_deadline), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
              {job.work_mode && (
                <div>
                  <p className="text-xs text-muted-foreground">Work Mode</p>
                  <p className="font-medium text-foreground capitalize">{job.work_mode}</p>
                </div>
              )}
              {job.role_category && (
                <div>
                  <p className="text-xs text-muted-foreground">Role Category</p>
                  <p className="font-medium text-foreground">{job.role_category}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetailView;
