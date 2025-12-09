import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Job, useAllJobs } from "@/hooks/useJobs";
import { useApplyToJob } from "@/hooks/useApplications";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import JobDetailsModal from "./JobDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter,
  Clock,
  Building2,
  X
} from "lucide-react";

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not specified";
  if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
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

const AllJobsList = () => {
  const { t } = useTranslation();
  const { data: jobs, isLoading, error, refetch } = useAllJobs();
  const { profile } = useCandidateProfile();
  const applyToJob = useApplyToJob();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

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
        <p className="text-destructive">{t("candidate.jobs.failedToLoad")}</p>
        <Button variant="ghost" onClick={() => refetch()} className="mt-2">
          {t("candidate.jobs.tryAgain")}
        </Button>
      </div>
    );
  }

  // Get unique locations and types for filters
  const locations = [...new Set(jobs?.map(j => j.location) || [])];
  const employmentTypes = [...new Set(jobs?.map(j => j.employment_type) || [])];

  // Filter jobs
  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills_required?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationFilter || job.location === locationFilter;
    const matchesType = !typeFilter || job.employment_type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  }) || [];

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setTypeFilter("");
  };

  const hasActiveFilters = searchTerm || locationFilter || typeFilter;

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("candidate.jobs.noJobsAvailable")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("candidate.jobs.checkBackLater")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("candidate.jobs.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-primary/10" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t("candidate.jobs.filters")}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("candidate.jobs.location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("candidate.jobs.allLocations")}</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("candidate.jobs.employmentType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("candidate.jobs.allTypes")}</SelectItem>
                {employmentTypes.map(type => (
                  <SelectItem key={type} value={type}>{formatEmploymentType(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                {t("candidate.jobs.clearAll")}
              </Button>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            {t("candidate.jobs.showingOf", { count: filteredJobs.length, total: jobs.length })}
          </p>
        )}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("candidate.jobs.noJobsMatch")}</p>
          <Button variant="ghost" onClick={clearFilters} className="mt-2">
            {t("candidate.jobs.clearFilters")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {job.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company_name}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t("candidate.jobs.yearsPlus", { years: job.experience_min || 0 })}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills_required.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            {t("candidate.jobs.more", { count: job.skills_required.length - 5 })}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formatEmploymentType(job.employment_type)}
                  </Badge>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                  >
                    {t("candidate.jobs.viewDetails")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default AllJobsList;